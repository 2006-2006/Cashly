const supabase = require('../config/supabase');
const { checkBusinessAccess } = require('../utils/accessControl');

// Use this for any logic that needs to run on server
const runForecast = async (req, res) => {
    // Stub: Frontend now handles this locally using lib/forecast.js
    res.json({ message: "Please use client-side forecasting" });
};

const compareScenarios = async (req, res) => {
    res.json({ message: "Scenario comparison moving to client" });
};

const saveScenario = async (req, res) => {
    try {
        const { businessId, name, assumptions, forecastData } = req.body;
        if (req.user) await checkBusinessAccess(req.user, businessId);

        const { data, error } = await supabase.from('scenarios').insert({
            business_id: businessId,
            user_id: req.user.id,
            name,
            type: 'Custom',
            assumptions,
            forecast_data: forecastData
        });

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getSavedScenarios = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (req.user) await checkBusinessAccess(req.user, businessId);

        const { data } = await supabase.from('scenarios').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
        res.json(data || []);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getHealthHistory = async (req, res) => {
    res.json([]);
};

const getHealth = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (req.user) await checkBusinessAccess(req.user, businessId);

        const [salesRes, expRes, recRes] = await Promise.all([
            supabase.from('sales').select('*').eq('business_id', businessId).order('date', { ascending: false }).limit(100),
            supabase.from('expenses').select('*').eq('business_id', businessId).order('date', { ascending: false }).limit(100),
            supabase.from('receivables').select('*').eq('business_id', businessId).eq('status', 'Overdue')
        ]);

        const sales = salesRes.data || [];
        const expenses = expRes.data || [];
        const receivables = recRes.data || [];

        const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const overdueReceivables = receivables.reduce((sum, r) => sum + (r.amount_due || r.amountDue), 0);

        const cashFlowScore = totalSales > 0 ? Math.min(100, Math.round((totalSales / (totalExpenses || 1)) * 50)) : 0;
        const collectionScore = overdueReceivables === 0 ? 100 : Math.max(0, 100 - Math.round((overdueReceivables / (totalSales || 1)) * 100));
        const runwayScore = totalExpenses > 0 ? Math.min(100, Math.round((totalSales / (totalExpenses / 30) / 30) * 100)) : 100;

        const score = Math.round((cashFlowScore * 0.4) + (collectionScore * 0.3) + (runwayScore * 0.3));

        let status = 'Excellent';
        if (score < 40) status = 'Critical';
        else if (score < 60) status = 'Poor';
        else if (score < 80) status = 'Good';

        const result = {
            score,
            status,
            components: [
                { name: 'Cash Flow', score: cashFlowScore, status: cashFlowScore > 70 ? 'Optimal' : 'Needs Work' },
                { name: 'Collection', score: collectionScore, status: collectionScore > 80 ? 'Good' : 'Lagging' },
                { name: 'Runway', score: runwayScore, status: runwayScore > 60 ? 'Healthy' : 'short' }
            ],
            insights: [
                score < 60 ? 'Consider reducing non-essential expenses immediately.' : 'Your cash buffer is healthy.',
                collectionScore < 70 ? 'Implement stricter follow-up for overdue payments.' : 'Your payment collection is efficient.',
                runwayScore < 50 ? 'Incoming revenue is barely covering short-term burn.' : 'Strategic investment possible given current stability.'
            ]
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    runForecast,
    compareScenarios,
    saveScenario,
    getSavedScenarios,
    getHealthHistory,
    getHealth
};
