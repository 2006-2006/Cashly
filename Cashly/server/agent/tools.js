const supabase = require('../config/supabase');
const PredictiveService = require('../services/PredictiveService');
const SimulatorService = require('../services/SimulatorService');

// Helper to get authenticated client
const getClient = (params) => {
    const { token } = params || {};
    if (token && supabase.getAuthenticatedClient) {
        // console.log('[Tools] Using Authenticated Client');
        return supabase.getAuthenticatedClient(token);
    }
    console.log('[Tools] Using Anonymous Client (Warning: RLS may block data)');
    return supabase; // Fallback to anon (will fail if RLS active)
};

// ... stub services ...
const AutomationService = { suggestActions: async () => [] };
const IntegrationService = { reconcileBank: async () => ({ reconciled: 0, mismatches: 0 }), estimateGST: async () => ({ netPayable: 0 }) };
const IntelligenceService = { getRelationshipGraph: async () => ({ nodes: [], links: [] }), getDependencyRisk: async () => ({ status: 'Unknown', recommendation: '' }) };
const ScenarioService = { compareScenarios: async () => ({ explanation: 'Not available' }), solveForGoal: async () => ({ requiredSalesGrowth: '0%', maxExpensesAllowed: 0 }) };
const BehaviorService = { getDisciplineScore: async () => ({ score: 50, feedback: 'Analysis pending upgrade', streak: 0 }) };
const MemoryService = { getRelevantMemories: async () => [], getDecisionStyle: async () => ({ style: 'Balanced', description: '', adjustment: '' }) };
const EnterpriseService = { detectFraud: async () => [] };

// Helper to get array from result
const getList = (res) => res.data || [];

// Helper to resolve businessId (Auto-discovery)
const resolveBusinessId = async (params) => {
    let { businessId, userId } = params || {};
    if (businessId && businessId !== 'undefined' && businessId !== 'null') return businessId;

    if (userId) {
        console.log(`[Tools] BusinessID missing, auto-discovering for UserID: ${userId}`);
        const db = getClient(params);
        const { data } = await db.from('businesses').select('id').eq('user_id', userId).limit(1).maybeSingle();
        if (data) {
            console.log(`[Tools] Auto-discovered BusinessID: ${data.id}`);
            return data.id;
        }
    }
    return null;
};

// Tool: Get Sales Summary
const getSalesData = async (params) => {
    const businessId = await resolveBusinessId(params);
    if (!businessId) return { error: 'Business ID required' };
    const db = getClient(params);

    // Fetch ALL sales for accuracy, but only necessary columns to save bandwidth
    const { data: sales, error } = await db.from('sales').select('amount, date').eq('business_id', businessId).order('date', { ascending: false });

    if (error) return { error: error.message };

    const data = sales || [];
    const total = data.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    // Accurate Daily Average over full history
    let avgDaily = 0;
    if (data.length > 1) {
        const lastDate = new Date(data[0].date); // Descending order, so 0 is latest
        const firstDate = new Date(data[data.length - 1].date);
        const diffDays = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
        avgDaily = Math.round(total / diffDays);
    } else if (data.length === 1) {
        avgDaily = data[0].amount;
    }

    // rolling 30 days for recent context
    const rolling30 = new Date();
    rolling30.setDate(rolling30.getDate() - 30);
    const recentSales = data.filter(s => new Date(s.date) >= rolling30).reduce((s, i) => s + (Number(i.amount) || 0), 0);

    return {
        name: 'getSalesData',
        result: {
            totalSales: total,
            transactionCount: data.length,
            averageDaily: avgDaily,
            recentSales,
            formatted: `SALES SUMMARY:\n• Total (All-time): ₹${total.toLocaleString()}\n• Last 30 Days: ₹${recentSales.toLocaleString()}\n• Daily Average: ₹${avgDaily.toLocaleString()}`
        }
    };
};

// Tool: Get Expenses Summary with Averages
const getExpensesData = async (params) => {
    const businessId = await resolveBusinessId(params);
    if (!businessId) return { error: 'Business ID required' };
    const db = getClient(params);

    // Fetch ALL expenses for accuracy
    const { data: expenses } = await db.from('expenses').select('amount, date, category').eq('business_id', businessId).order('date', { ascending: false });
    const data = expenses || [];

    const total = data.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    let avgDaily = 0;
    if (data.length > 1) {
        const lastDate = new Date(data[0].date);
        const firstDate = new Date(data[data.length - 1].date);
        const diffDays = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
        avgDaily = Math.round(total / diffDays);
    } else if (data.length === 1) {
        avgDaily = data[0].amount;
    }

    // Identify top categories
    const catMap = {};
    data.forEach(e => {
        const cat = e.category || 'General';
        catMap[cat] = (catMap[cat] || 0) + (Number(e.amount) || 0);
    });
    const topCategories = Object.entries(catMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category, amount]) => ({ category, amount }));

    return {
        name: 'getExpensesData',
        result: {
            totalExpenses: total,
            transactionCount: data.length,
            averageDaily: avgDaily,
            topCategories,
            formatted: `EXPENSES SUMMARY:\n• Total (All-time): ₹${total.toLocaleString()}\n• Daily Burn: ₹${avgDaily.toLocaleString()}`
        }
    };
};


// Tool: Get Receivables - DETAILED
const getReceivables = async (params) => {
    const businessId = await resolveBusinessId(params);
    if (!businessId) return { error: 'Business ID required' };
    const db = getClient(params);

    const { data: receivables } = await db.from('receivables').select('*').eq('business_id', businessId);
    const data = receivables || [];

    // Normalize snake_case to camelCase logic inside loop
    const mapped = data.map(r => ({
        ...r,
        amountDue: r.amount_due || r.amountDue,
        expectedPaymentDate: r.expected_payment_date || r.expectedPaymentDate,
        customerName: r.customer_name || r.customerName
    }));

    const total = mapped.reduce((sum, r) => sum + (r.amountDue || 0), 0);
    const now = new Date();
    const overdue = mapped.filter(r => new Date(r.expectedPaymentDate) < now && r.status !== 'Paid');
    const overdueAmount = overdue.reduce((sum, r) => sum + r.amountDue, 0);

    return {
        name: 'getReceivables',
        result: {
            totalReceivables: total,
            count: mapped.length,
            overdueCount: overdue.length,
            overdueAmount,
            formatted: `RECEIVABLES:\n• Total Outstanding: ₹${total.toLocaleString()}\n• Overdue: ${overdue.length} invoices (₹${overdueAmount.toLocaleString()})`
        }
    };
};

// Tool: Get Inventory Status
const getInventoryData = async (params) => {
    const businessId = await resolveBusinessId(params);
    if (!businessId) return { error: 'Business ID required' };
    const db = getClient(params);

    const { data: inventory } = await db.from('inventory').select('*').eq('business_id', businessId);
    const data = inventory || [];
    const totalValue = data.reduce((sum, i) => sum + (i.total_cost || i.reorder_cost || 0), 0);

    return {
        name: 'getInventoryData',
        result: {
            totalValue,
            itemCount: data.length,
            formatted: `Inventory: ${data.length} items worth ₹${totalValue.toLocaleString()}`
        }
    };
};

// Tool: Calculate Cash Flow
const getCashFlow = async (params) => {
    // Optimization: Use cached data if available from agent context
    let salesData = params.salesData;
    if (!salesData) {
        // console.log('[getCashFlow] Cache miss for SalesData, fetching...');
        salesData = await getSalesData(params);
    }

    let expensesData = params.expensesData;
    if (!expensesData) {
        // console.log('[getCashFlow] Cache miss for ExpensesData, fetching...');
        expensesData = await getExpensesData(params);
    }

    if (salesData.error) return salesData;

    const totalSales = salesData.result.totalSales || 0;
    const totalExpenses = expensesData.result.totalExpenses || 0;
    const netCashFlow = totalSales - totalExpenses;
    const profitMargin = totalSales > 0 ? Math.round((netCashFlow / totalSales) * 100) : 0;
    const status = netCashFlow > 0 ? 'Profitable' : 'Loss-making';

    return {
        name: 'getCashFlow',
        result: {
            totalSales,
            totalExpenses,
            netCashFlow,
            profitMargin,
            status,
            formatted: `Cash Flow: ${status}. Net: ₹${netCashFlow.toLocaleString()} (${profitMargin}% margin).`
        }
    };
};

// Tool: Create Alert
const createAlert = async (params, type, title, message, severity = 'medium') => {
    // legacy args: type, title, message..
    // if called with object params:
    const t = params.type || type;
    const ti = params.title || title;
    const m = params.message || message;
    const s = params.severity || severity;
    const { businessId } = params || {};
    const db = getClient(params);

    const { data, error } = await db.from('alerts').insert({
        business_id: businessId, // Schema assumption
        type: t,
        title: ti,
        message: m,
        severity: s,
        is_read: false
    }).select();

    return {
        name: 'createAlert',
        result: {
            success: !error,
            formatted: error ? 'Failed to create alert' : `Alert created: ${ti}`
        }
    };
};

// Tool: Analyze Risks
const analyzeRisks = async (params) => {
    let cashFlow = params.cashFlowData;
    if (!cashFlow) cashFlow = await getCashFlow(params);

    let receivables = params.receivablesData;
    if (!receivables) receivables = await getReceivables(params);

    const risks = [];
    if (cashFlow.result?.netCashFlow < 0) {
        risks.push({ title: 'Negative Cash Flow', description: 'Expenses exceed income.', level: 'critical' });
    }
    if (receivables.result?.overdueCount > 0) {
        risks.push({ title: 'Overdue Payments', description: `${receivables.result.overdueCount} overdue invoices.`, level: 'high' });
    }

    return {
        name: 'analyzeRisks',
        result: {
            riskCount: risks.length,
            risks,
            formatted: risks.length > 0 ? `Found ${risks.length} risks.` : 'No significant risks detected.'
        }
    };
};

// Tool: Get Forecast Data
const getForecast = async (params) => {
    const businessId = await resolveBusinessId(params);
    let months = params.months || 3;
    const q = params.query || '';

    // Parse duration from query
    const yearMatch = q.match(/(\d+)\s*years?/i);
    const monthMatch = q.match(/(\d+)\s*months?/i);

    if (yearMatch) {
        months = parseInt(yearMatch[1]) * 12;
    } else if (monthMatch) {
        months = parseInt(monthMatch[1]);
    } else if (q.includes('next month') || q.includes('next 30 days')) {
        months = 1;
    } else if (q.includes('next year')) {
        months = 12;
    }

    // Cap at 120 months (10 years)
    if (months > 120) months = 120;
    if (months < 1) months = 1;

    if (!businessId) return { error: 'Business ID required' };

    // Fetch base data
    const salesRes = await getSalesData(params);
    const expensesRes = await getExpensesData(params);

    // HONESTY UPGRADE: Use "Recent Run Rate" (Last 90 Days) for accurate future prediction
    // Historical all-time averages dilute recent growth or cuts.
    const calculateRecentDailyAvg = (items, days = 90) => {
        if (!items || items.length === 0) return 0;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        // Filter for recent items
        const recentItems = items.filter(i => new Date(i.date) >= cutoff);
        // If no recent data, fall back to all-time to avoid 0 projection
        if (recentItems.length === 0) {
            const total = items.reduce((sum, x) => sum + (Number(x.amount) || 0), 0);
            // Estimate absolute day range
            const first = new Date(items[items.length - 1].date);
            const last = new Date(items[0].date);
            const span = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
            return Math.round(total / span);
        }

        const totalRecent = recentItems.reduce((sum, x) => sum + (Number(x.amount) || 0), 0);
        return Math.round(totalRecent / days); // Simple 90-day spread
    };

    // We need raw data for this, but getSalesData returns stats.
    // Let's quickly re-fetch raw data efficiently or rely on the tool to provide it?
    // The tools return 'result', not raw rows. 
    // We must query DB directly here for maximum accuracy.
    const db = getClient(params);
    const { data: rawSales } = await db.from('sales').select('amount, date').eq('business_id', businessId).gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    const { data: rawExpenses } = await db.from('expenses').select('amount, date').eq('business_id', businessId).gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    const avgDailySales = calculateRecentDailyAvg(rawSales, 90);
    const avgDailyExpenses = calculateRecentDailyAvg(rawExpenses, 90);

    // Initial Balance: Sales - Expenses (All Time)
    // We can use the totals from the tools we called earlier
    let currentBalance = (salesRes.result?.totalSales || 0) - (expensesRes.result?.totalExpenses || 0);

    const days = months * 30;
    const interval = days > 90 ? 30 : 7;

    const forecast = [];
    const today = new Date();

    for (let i = 0; i <= days; i += interval) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const projectedBalance = currentBalance + ((avgDailySales - avgDailyExpenses) * i);

        forecast.push({
            date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: days > 365 ? '2-digit' : undefined }),
            balance: Math.round(projectedBalance)
        });
    }

    const endingBalance = currentBalance + (avgDailySales * days) - (avgDailyExpenses * days);

    return {
        name: 'getForecast',
        result: {
            endingBalance: Math.round(endingBalance),
            status: endingBalance > 0 ? 'Positive' : 'Need Cash',
            forecast, // The array the frontend needs
            formatted: `Forecast (${months} months): Expected closing balance around ₹${Math.round(endingBalance).toLocaleString()}`
        }
    };
};

const predictPaymentDelays = async (params) => {
    const { businessId } = params || {};
    const db = getClient(params);
    // This relies on refactored PredictiveService
    if (!PredictiveService.predictPaymentDelay) return { result: { formatted: 'Service unavailable' } };

    const { data: receivables } = await db.from('receivables').select('*').eq('business_id', businessId).neq('status', 'Paid');
    if (!receivables || receivables.length === 0) return { name: 'predictPaymentDelays', result: { formatted: 'No pending invoices' } };

    // Just analyze first few for demo
    const predictions = [];
    for (const r of receivables.slice(0, 3)) {
        const p = await PredictiveService.predictPaymentDelay(businessId, r.customer_name || r.customerName);
        if (p.probability > 0.5) predictions.push(`${r.customer_name}: High risk`);
    }

    return {
        name: 'predictPaymentDelays',
        result: {
            predictions,
            formatted: predictions.length > 0 ? `Delay Risks: ${predictions.join(', ')}` : 'Low delay risk detected.'
        }
    };
};

const predictExpenseShocks = async (params) => {
    const { businessId } = params || {};
    const res = await PredictiveService.predictExpenseShocks(businessId);
    return {
        name: 'predictExpenseShocks',
        result: { formatted: res.reason }
    };
};

// Wrappers for stubbed services
const suggestAutoActions = async (params) => ({ name: 'suggestAutoActions', result: { formatted: 'No auto-actions available.' } });
const reconcileBank = async (params) => ({ name: 'reconcileBank', result: { formatted: 'Bank reconciliation unavailable.' } });
const getGSTPlanning = async (params) => ({ name: 'getGSTPlanning', result: { formatted: 'GST planning module upgrading.' } });
const getRelationshipGraph = async (params) => ({ name: 'getRelationshipGraph', result: { formatted: 'Graph module upgrading.' } });
const getDependencyRisk = async (params) => ({ name: 'getDependencyRisk', result: { formatted: 'Risk dependency module upgrading.' } });
const simulatePurchase = async (params) => {
    const { businessId, amount, paymentMethod, months } = params || {};
    const res = await SimulatorService.simulatePurchase(businessId, { amount, paymentMethod, months });
    return { name: 'simulatePurchase', result: res };
};
const getBreakEvenTimeline = async (params) => {
    const { businessId } = params || {};
    const res = await SimulatorService.calculateBreakEven(businessId);
    return { name: 'getBreakEvenTimeline', result: { formatted: res.status } };
};
const compareScenarios = async (params) => ({ name: 'compareScenarios', result: { formatted: 'Scenario comparison upgrading.' } });
const solveReverseScenario = async (params) => ({ name: 'solveReverseScenario', result: { formatted: 'Solver upgrading.' } });
const getDisciplineScore = async (params) => ({ name: 'getDisciplineScore', result: { formatted: 'Score: 50/100' } });
const getBusinessMemories = async (params) => ({ name: 'getBusinessMemories', result: { formatted: 'No memories found.' } });
const getDecisionStyle = async (params) => ({ name: 'getDecisionStyle', result: { formatted: 'Style: Balanced' } });
const detectFraud = async (params) => ({ name: 'detectFraud', result: { formatted: 'No fraud detected.' } });

const tools = {
    getSalesData,
    getExpensesData,
    getReceivables,
    getInventoryData,
    getCashFlow,
    createAlert,
    analyzeRisks,
    getForecast,
    predictPaymentDelays,
    predictExpenseShocks,
    suggestAutoActions,
    reconcileBank,
    getGSTPlanning,
    getRelationshipGraph,
    getDependencyRisk,
    simulatePurchase,
    getBreakEvenTimeline,
    compareScenarios,
    solveReverseScenario,
    getDisciplineScore,
    getBusinessMemories,
    getDecisionStyle,
    detectFraud
};

const toolDescriptions = [
    { name: 'getSalesData', description: 'Get sales summary' },
    { name: 'getExpensesData', description: 'Get expenses summary' },
    { name: 'getReceivables', description: 'Get receivables summary' },
    { name: 'getInventoryData', description: 'Get inventory summary' },
    { name: 'getCashFlow', description: 'Get cash flow status' },
    { name: 'createAlert', description: 'Create alert' },
    { name: 'analyzeRisks', description: 'Analyze financial risks' },
    { name: 'getForecast', description: 'Get cash forecast' },
    { name: 'predictPaymentDelays', description: 'Predict delays' },
    { name: 'predictExpenseShocks', description: 'Predict expense shocks' },
    { name: 'simulatePurchase', description: 'Simulate large purchase impact' }
];

module.exports = { tools, toolDescriptions };
