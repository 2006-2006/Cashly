const supabase = require('../config/supabase');
const { checkBusinessAccess } = require('../utils/accessControl');
const crypto = require('crypto');

// @desc    Generate daily brief
const generateDailyBrief = async (req, res) => {
    try {
        const { businessId, currentCash = 0 } = req.body;
        console.log(`[DailyBrief] Generating for ${businessId}`);

        if (req.user) await checkBusinessAccess(req.user, businessId);

        // Get Authenticated Client
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        const db = token && supabase.getAuthenticatedClient ? supabase.getAuthenticatedClient(token) : supabase;
        console.log(`[DailyBrief] Auth Token: ${!!token}`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch data
        const [recRes, expRes, salesRes] = await Promise.all([
            db.from('receivables')
                .select('*')
                .eq('business_id', businessId)
                .lt('expected_payment_date', tomorrow.toISOString())
                .eq('status', 'Pending'),
            db.from('expenses')
                .select('*')
                .eq('business_id', businessId)
                .gte('date', today.toISOString())
                .lt('date', tomorrow.toISOString()),
            db.from('sales')
                .select('*')
                .eq('business_id', businessId)
                .gte('date', today.toISOString())
                .lt('date', tomorrow.toISOString())
        ]);

        const todayReceivables = recRes.data || [];
        const todayExpenses = expRes.data || [];
        const todaySales = salesRes.data || [];

        console.log(`[DailyBrief] Found: ${todayReceivables.length} receivables, ${todayExpenses.length} expenses, ${todaySales.length} sales`);

        // Logic
        const receivableInflows = todayReceivables.reduce((sum, r) => sum + (r.amount_due || 0), 0);
        const actualSalesInflows = todaySales.reduce((sum, s) => sum + (s.amount || 0), 0);
        const manualExpenses = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        // Stub recurring for now (or query if table exists)
        const recurringInflows = 0;
        const recurringOutflows = 0;

        const totalExpectedInflows = receivableInflows + recurringInflows + actualSalesInflows;
        const totalExpectedOutflows = manualExpenses + recurringOutflows;
        const netDailyChange = totalExpectedInflows - totalExpectedOutflows;
        const projectedEndingBalance = currentCash + netDailyChange;

        // Actions
        const actions = [];

        // 1. Critical Collections
        todayReceivables
            .sort((a, b) => (b.amount_due || 0) - (a.amount_due || 0))
            .forEach((r, idx) => {
                actions.push({
                    priority: idx === 0 ? 'High' : 'Medium',
                    action: `Collect ₹${(r.amount_due || 0).toLocaleString('en-IN')} from ${r.customer_name || 'Unknown'}`,
                    category: 'Collection'
                });
            });

        // If no immediate collections, look ahead 3 days for upcoming
        if (actions.length === 0) {
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(today.getDate() + 3);
            const { data: upcoming } = await db.from('receivables')
                .select('*')
                .eq('business_id', businessId)
                .gt('expected_payment_date', tomorrow.toISOString())
                .lt('expected_payment_date', threeDaysFromNow.toISOString())
                .limit(3);

            if (upcoming && upcoming.length > 0) {
                upcoming.forEach(r => {
                    actions.push({
                        priority: 'Medium',
                        action: `Upcoming: ₹${(r.amount_due || 0).toLocaleString('en-IN')} from ${r.customer_name} due soon.`,
                        category: 'Planning'
                    });
                });
            }
        }

        // 2. High Value Payments
        if (manualExpenses > currentCash * 0.3 && currentCash > 0) {
            actions.push({
                priority: 'High',
                action: `Major payment of ₹${manualExpenses.toLocaleString('en-IN')} due today. Confirm liquidity!`,
                category: 'Payment'
            });
        }

        // 3. Survival
        if (projectedEndingBalance < 0) {
            actions.push({
                priority: 'Critical',
                action: `⚠️ WARNING: Projected EOD is ₹${projectedEndingBalance.toLocaleString('en-IN')}. Delay ₹${Math.abs(projectedEndingBalance).toLocaleString('en-IN')} in payments.`,
                category: 'Survival'
            });
        }

        // 4. Momentum
        if (actualSalesInflows > 0) {
            actions.push({
                priority: 'Low',
                action: `Recorded ₹${actualSalesInflows.toLocaleString('en-IN')} in sales so far.`,
                category: 'Momentum'
            });
        }

        if (actions.length === 0) {
            actions.push({
                priority: 'Medium',
                action: "No immediate financial events detected today. Focus on sales or long-term planning.",
                category: 'Strategy'
            });
        }

        let summaryPrefix = "Steady Day.";
        if (netDailyChange > 0) summaryPrefix = "Growth Day!";
        if (netDailyChange < -currentCash * 0.5 && currentCash > 0) summaryPrefix = "Caution Required.";
        if (projectedEndingBalance < 0) summaryPrefix = "Liquidity Alert!";
        if (totalExpectedInflows === 0 && totalExpectedOutflows === 0) summaryPrefix = "Quiet Day.";

        const summary = `${summaryPrefix} Today: ₹${totalExpectedInflows.toLocaleString('en-IN')} In, ₹${totalExpectedOutflows.toLocaleString('en-IN')} Out. EOD: ₹${projectedEndingBalance.toLocaleString('en-IN')}.`;

        const responseData = {
            date: today,
            startingBalance: currentCash,
            expectedInflows: totalExpectedInflows,
            expectedOutflows: totalExpectedOutflows,
            endingBalance: projectedEndingBalance,
            actions: actions.slice(0, 5),
            summary,
            stats: {
                inflowBreakdown: { receivables: receivableInflows, recurring: recurringInflows, sales: actualSalesInflows },
                outflowBreakdown: { manual: manualExpenses, recurring: recurringOutflows }
            }
        };

        // Try to save
        try {
            await db.from('daily_briefs').upsert({
                business_id: businessId,
                date: today.toISOString(),
                content: responseData // Storing as JSON if column supports it, or individual cols
            });
        } catch (e) {
            console.log('Daily Brief storage skipped:', e.message);
        }

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Daily Brief Error:', error);
        res.status(400).json({ message: error.message });
    }
};

const generateWeeklyReport = async (req, res) => {
    // Stub or Refactor similarly. Minimizing risk by returning basic calculated data.
    try {
        const { businessId } = req.body;
        if (req.user) await checkBusinessAccess(req.user, businessId);

        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);

        const [salesRes, expRes] = await Promise.all([
            supabase.from('sales')
                .select('*')
                .eq('business_id', businessId)
                .gte('date', weekStart.toISOString()),
            supabase.from('expenses')
                .select('*')
                .eq('business_id', businessId)
                .gte('date', weekStart.toISOString())
        ]);

        const sales = salesRes.data || [];
        const expenses = expRes.data || [];

        const totalInflows = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
        const totalOutflows = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const netCashFlow = totalInflows - totalOutflows;

        res.status(200).json({
            weekStart,
            weekEnd: today,
            metrics: { totalInflows, totalOutflows, netCashFlow },
            trends: [],
            focusItems: [],
            shareableLink: '#'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getSharedReport = async (req, res) => {
    res.status(404).json({ message: 'Report not found' });
};

const getDailyHistory = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (req.user) await checkBusinessAccess(req.user, businessId);

        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        const db = token && supabase.getAuthenticatedClient ? supabase.getAuthenticatedClient(token) : supabase;

        // Try fetch
        const { data, error } = await db.from('daily_briefs')
            .select('*')
            .eq('business_id', businessId)
            .order('date', { ascending: false })
            .limit(7);

        if (error) throw error;

        // Map back to frontend expected structure (if stored as content json)
        // Assuming we stored 'content' field with the json.
        const briefs = (data || []).map(row => row.content || row);
        res.status(200).json(briefs);
    } catch (error) {
        console.log('History fetch passed empty:', error.message);
        res.status(200).json([]);
    }
};

const getSituationData = async (req, res) => {
    try {
        const { businessId } = req.params;
        if (req.user) await checkBusinessAccess(req.user, businessId);

        const [salesRes, expRes] = await Promise.all([
            supabase.from('sales').select('*').eq('business_id', businessId),
            supabase.from('expenses').select('*').eq('business_id', businessId)
        ]);

        const sales = salesRes.data || [];
        const totalSales = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
        const totalExpenses = (expRes.data || []).reduce((sum, e) => sum + (e.amount || 0), 0);
        const currentCash = totalSales - totalExpenses;

        const dailyBurn = totalExpenses > 0 ? Math.round(totalExpenses / 30) : 0; // Rough estimate
        const runwayDays = dailyBurn > 0 ? Math.floor(currentCash / dailyBurn) : 365;

        res.status(200).json({
            runway: runwayDays,
            cashBalance: currentCash,
            healthScore: 80,
            dailyBurn
        });
    } catch (error) {
        console.error('Situation Data Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Stubs for others
const explainRisk = async (req, res) => res.json({ explanation: 'AI analyzing...' });
const handleGeneralQuery = async (req, res) => res.json({ response: 'AI processing...' });
const getAlerts = async (req, res) => res.json([]);
const markAlertRead = async (req, res) => res.json({ success: true });
const generateAIInsights = async (req, res) => res.json({ insights: [] }); // Use aiController instead
const getInsights = async (req, res) => res.json([]);
const askQuestion = async (req, res) => res.json({ response: 'Ask AI controller' });
const generateAlerts = async (req, res) => res.json({ alerts: [] });
const getIntelligenceGraph = async (req, res) => res.json({ graph: { nodes: [], links: [] } });
const getGSTProjection = async (req, res) => res.json({ netPayable: 0 });

module.exports = {
    generateDailyBrief,
    generateWeeklyReport,
    getSharedReport,
    getDailyHistory,
    getSituationData,
    explainRisk,
    handleGeneralQuery,
    getAlerts,
    markAlertRead,
    generateAIInsights,
    getInsights,
    askQuestion,
    generateAlerts,
    getIntelligenceGraph,
    getGSTProjection
};
