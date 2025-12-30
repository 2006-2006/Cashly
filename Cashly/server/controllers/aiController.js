const CashlyAgent = require('../agent/agent');
const supabase = require('../config/supabase');
const { checkBusinessAccess } = require('../utils/accessControl');
// const IntelligenceService = require('../services/IntelligenceService'); // Stubbed in tools, ignore here if not critical or stub
// const IntegrationService = require('../services/IntegrationService');

// Create agent instance
const agent = new CashlyAgent();

// Generate MSME-friendly insights from forecast data
const generateInsights = (forecastData, sales, expenses, receivables) => {
    const insights = [];

    // 1. Negative balance risk dates
    const negativeDays = forecastData.filter(f => (f.projectedBalance || f.predictedCashBalance) < 0);
    if (negativeDays.length > 0) {
        insights.push({
            type: 'Risk',
            severity: 'Critical',
            title: '⚠️ Cash Shortage Alert',
            description: `Your shop may run out of money on ${negativeDays.length} day(s). First risky date: ${new Date(negativeDays[0]?.date).toLocaleDateString('en-IN')}`,
        });
    }

    // 2. Customer dependency
    if (receivables && receivables.length > 0) {
        const totalDue = receivables.reduce((sum, r) => sum + (r.amount_due || r.amountDue), 0);
        const sortedByAmount = [...receivables].sort((a, b) => (b.amount_due || b.amountDue) - (a.amount_due || a.amountDue));
        const topCustomer = sortedByAmount[0];
        const topAmt = topCustomer.amount_due || topCustomer.amountDue;
        const custName = topCustomer.customer_name || topCustomer.customerName;

        if (topCustomer && topAmt / totalDue > 0.4) {
            insights.push({
                type: 'Risk',
                severity: 'Medium',
                title: '👥 High Customer Dependency',
                description: `${custName} owes ₹${topAmt.toLocaleString('en-IN')} - that's ${Math.round(topAmt / totalDue * 100)}% of all pending money.`,
            });
        }
    }

    return insights;
};

// @desc    Generate AI insights
const generateAIInsights = async (req, res) => {
    try {
        const { businessId, forecastData } = req.body;

        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        const db = token && supabase.getAuthenticatedClient ? supabase.getAuthenticatedClient(token) : supabase;

        if (businessId && req.user) await checkBusinessAccess(req.user, businessId, db);

        const [salesRes, expRes, recRes] = await Promise.all([
            db.from('sales').select('*').eq('business_id', businessId).order('date', { ascending: false }).limit(500),
            db.from('expenses').select('*').eq('business_id', businessId).order('date', { ascending: false }).limit(500),
            db.from('receivables').select('*').eq('business_id', businessId).eq('status', 'Pending')
        ]);

        const insights = generateInsights(forecastData || [], salesRes.data || [], expRes.data || [], recRes.data || []);

        // Save insights to database
        if (businessId && insights.length > 0) {
            const inserts = insights.map(i => ({ business_id: businessId, ...i, is_dismissed: false }));
            await supabase.from('insights').insert(inserts);
        }

        res.status(200).json({ insights });
    } catch (error) {
        console.error('AI Insights Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get saved insights
const getInsights = async (req, res) => {
    try {
        const { businessId } = req.query;
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        const db = token && supabase.getAuthenticatedClient ? supabase.getAuthenticatedClient(token) : supabase;

        if (businessId && req.user) await checkBusinessAccess(req.user, businessId, db);

        const { data } = await db.from('insights')
            .select('*')
            .eq('business_id', businessId)
            .eq('is_dismissed', false)
            .order('created_at', { ascending: false })
            .limit(20);

        res.status(200).json(data || []);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Natural language Q&A
const askQuestion = async (req, res) => {
    try {
        const { query, businessId, currentCash, metrics, situation } = req.body;

        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        const db = token && supabase.getAuthenticatedClient ? supabase.getAuthenticatedClient(token) : supabase;

        if (businessId && req.user) await checkBusinessAccess(req.user, businessId, db);

        // Create fresh agent instance for this request
        const agent = new CashlyAgent();

        // Delegate to advance reasoning agent
        const result = await agent.run(query, {
            businessId,
            userId: req.user?.id,
            currentCash,
            token, // Pass token for RLS
            metrics, // Essential for sub-5ms path
            situation // Essential for sub-5ms path
        });

        res.status(200).json({
            response: result.response,
            query,
            classification: result.classification || { category: 'Informational', tone: 'Precise' },
            steps: result.steps || [],
            duration: result.duration,
            chartData: result.chartData,
            isFastPath: result.isFastPath
        });
    } catch (error) {
        console.error('Ask Question Error:', error);
        res.status(200).json({ // Return 200 with error message to prevent frontend crash
            response: "I encountered a system error. Please try again.",
            steps: [{ id: 1, type: 'error', message: 'System Error: ' + error.message }],
            classification: { category: 'Error', tone: 'Apologetic' }
        });
    }
};

const explainRisk = async (req, res) => {
    try {
        const { businessId } = req.query;
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        const result = await agent.run('Analyze business risks', {
            businessId,
            userId: req.user?.id,
            token
        });
        res.json({
            explanation: result.response,
            steps: result.steps
        });
    } catch (error) {
        res.json({ explanation: 'Unable to analyze risks' });
    }
};

const handleGeneralQuery = async (req, res) => {
    console.log(`[AI] Request received: "${req.body.query}"`);
    try {
        const { query, businessId, metrics, situation } = req.body;
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        const result = await agent.run(query || 'Give me an overview', {
            businessId,
            userId: req.user?.id,
            token,
            metrics, // Essential for sub-5ms path
            situation // Essential for sub-5ms path
        });

        return res.json({
            response: result.response,
            steps: result.steps,
            toolsUsed: result.toolsUsed,
            duration: result.duration,
            isFastPath: result.isFastPath,
            classification: result.classification || { category: 'Informational', tone: 'Precise' }
        });
    } catch (error) {
        return res.json({ response: 'Error processing query.' });
    }
};

// Get alerts
const getAlerts = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.json([]);

        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        const db = token && supabase.getAuthenticatedClient ? supabase.getAuthenticatedClient(token) : supabase;

        if (req.user) await checkBusinessAccess(req.user, businessId, db);

        const { data } = await db.from('alerts')
            .select('*')
            .eq('business_id', businessId)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(10);

        res.json(data || []);
    } catch (error) {
        res.json([]);
    }
};

// Mark alert as read
const markAlertRead = async (req, res) => {
    try {
        await supabase.from('alerts').update({ is_read: true }).eq('id', req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate alerts based on forecast
const generateAlerts = async (req, res) => {
    try {
        const { businessId, forecastData, currentCash } = req.body;
        if (businessId && req.user) await checkBusinessAccess(req.user, businessId);

        const alerts = [];
        if (forecastData) {
            const lowestDay = forecastData.reduce((min, f) =>
                (f.projectedBalance || f.predictedCashBalance || 999999) < (min.projectedBalance || min.predictedCashBalance || 999999) ? f : min
                , forecastData[0]);

            const lowBal = lowestDay?.projectedBalance || lowestDay?.predictedCashBalance || 0;
            if (lowBal < 10000) {
                alerts.push({
                    business_id: businessId,
                    type: 'LowBalance',
                    severity: lowBal < 0 ? 'Critical' : 'Warning',
                    title: 'Low Cash Balance Coming',
                    message: `Balance may drop to ₹${lowBal.toLocaleString('en-IN')} on ${new Date(lowestDay.date).toLocaleDateString()}`,
                    is_read: false
                });
            }
        }

        if (alerts.length > 0) {
            await supabase.from('alerts').insert(alerts);
        }

        res.status(200).json({ alerts });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getIntelligenceGraph = async (req, res) => {
    res.json({ graph: { nodes: [], links: [] }, risk: { status: 'Module upgrading' } });
};

const getGSTProjection = async (req, res) => {
    res.json({ netPayable: 0, message: 'GST Upgrade in progress' });
};

const getSituationData = async (req, res) => {
    try {
        const { businessId } = req.params;

        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        const db = token && supabase.getAuthenticatedClient ? supabase.getAuthenticatedClient(token) : supabase;

        if (req.user) await checkBusinessAccess(req.user, businessId, db);

        const [salesRes, expRes, recRes] = await Promise.all([
            db.from('sales').select('amount, date').eq('business_id', businessId),
            db.from('expenses').select('amount, date').eq('business_id', businessId),
            db.from('receivables').select('*').eq('business_id', businessId).eq('status', 'Pending')
        ]);

        const sales = salesRes.data || [];
        const totalSales = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

        const expenses = expRes.data || [];
        const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        const currentCash = totalSales - totalExpenses;

        // Accurate Burn Rate (Last 90 Days)
        const now = new Date();
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentExpenses90 = expenses
            .filter(e => new Date(e.date) >= ninetyDaysAgo)
            .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        const recentExpenses30 = expenses
            .filter(e => new Date(e.date) >= thirtyDaysAgo)
            .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        // Smart Burn: Prefer 90-day average, fallback to 30-day if 90 is too sparse, else all-time
        let dailyBurn = 0;
        if (recentExpenses90 > 0) {
            dailyBurn = Math.round(recentExpenses90 / 90);
        } else if (recentExpenses30 > 0) {
            dailyBurn = Math.round(recentExpenses30 / 30);
        } else if (totalExpenses > 0) {
            dailyBurn = Math.round(totalExpenses / 30); // Last resort fallback
        }

        const runwayDays = dailyBurn > 0 ? Math.floor(currentCash / dailyBurn) : (currentCash > 0 ? 365 : 0);

        res.status(200).json({
            runway: runwayDays,
            cashBalance: currentCash,
            healthScore: runwayDays > 180 ? 90 : (runwayDays > 90 ? 80 : (runwayDays > 30 ? 60 : (currentCash < 0 ? 10 : 30))),
            dailyBurn,
            velocity: { change: 0, trend: 'stable' } // metrics for frontend
        });
    } catch (error) {
        console.error('Situation Data Error:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    explainRisk,
    handleGeneralQuery,
    getAlerts,
    markAlertRead,
    generateAIInsights,
    getInsights,
    askQuestion,
    generateAlerts,
    getIntelligenceGraph,
    getGSTProjection,
    getSituationData
};
