const supabase = require('../config/supabase');

// Helper to get DB Client (Authenticated vs Anon)
const getDbClient = (req) => {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    return token && supabase.getAuthenticatedClient ? supabase.getAuthenticatedClient(token) : supabase;
};

const getSales = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);
        // Supabase query
        const { data, error } = await db
            .from('sales')
            .select('*')
            .eq('business_id', businessId)
            .order('date', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExpenses = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);
        const { data, error } = await db
            .from('expenses')
            .select('*')
            .eq('business_id', businessId)
            .order('date', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInventory = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);
        const { data, error } = await db
            .from('inventory')
            .select('*')
            .eq('business_id', businessId)
            .order('expected_payment_date', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReceivables = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);
        const { data, error } = await db
            .from('receivables')
            .select('*')
            .eq('business_id', businessId)
            .order('expected_payment_date', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMetrics = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);

        // Parallel Fetch
        const [salesRes, expensesRes, receivablesRes] = await Promise.all([
            db.from('sales').select('amount').eq('business_id', businessId),
            db.from('expenses').select('amount').eq('business_id', businessId),
            db.from('receivables').select('amount_due').eq('business_id', businessId).eq('status', 'Pending')
        ]);

        if (salesRes.error) throw salesRes.error;
        if (expensesRes.error) throw expensesRes.error;
        if (receivablesRes.error) throw receivablesRes.error;

        const totalSales = salesRes.data.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        const totalExpenses = expensesRes.data.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const totalReceivables = receivablesRes.data.reduce((sum, r) => sum + (Number(r.amount_due) || 0), 0);
        const burnRate = totalExpenses / 30; // Simply monthly avg proxy
        const netProfit = totalSales - totalExpenses;
        const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0;

        res.status(200).json({
            totalSales,
            totalExpenses,
            totalReceivables,
            burnRate: Math.round(burnRate),
            netCashFlow: netProfit,
            netProfit,
            profitMargin,
            salesCount: salesRes.data.length,
            expensesCount: expensesRes.data.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTopDebtors = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);
        const { data, error } = await db
            .from('receivables')
            .select('*')
            .eq('business_id', businessId)
            .eq('status', 'Pending')
            .order('amount_due', { ascending: false })
            .limit(5);

        if (error) throw error;

        const topDebtors = data.map(r => ({
            name: r.customer_name,
            amount: r.amount_due,
            daysOverdue: Math.max(0, Math.floor((new Date() - new Date(r.expected_payment_date || r.invoice_date)) / (1000 * 60 * 60 * 24)))
        }));

        res.status(200).json(topDebtors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRecentTransactions = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);
        const [salesRes, expensesRes] = await Promise.all([
            db.from('sales').select('*').eq('business_id', businessId).order('date', { ascending: false }).limit(5),
            db.from('expenses').select('*').eq('business_id', businessId).order('date', { ascending: false }).limit(5)
        ]);

        if (salesRes.error) throw salesRes.error;
        if (expensesRes.error) throw expensesRes.error;

        const combined = [
            ...salesRes.data.map(s => ({ ...s, type: 'income' })),
            ...expensesRes.data.map(e => ({ ...e, type: 'expense' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        res.status(200).json(combined);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDailyProfit = async (req, res) => {
    try {
        const { businessId } = req.query;
        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const dateStr = fourteenDaysAgo.toISOString();

        const [salesRes, expensesRes] = await Promise.all([
            db.from('sales').select('*').eq('business_id', businessId).gte('date', dateStr),
            db.from('expenses').select('*').eq('business_id', businessId).gte('date', dateStr)
        ]);

        if (salesRes.error) throw salesRes.error;
        if (expensesRes.error) throw expensesRes.error;

        const dailyData = {};
        // Initialize last 14 days
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            dailyData[dStr] = 0;
        }

        salesRes.data.forEach(s => {
            const d = new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            if (Object.prototype.hasOwnProperty.call(dailyData, d)) dailyData[d] += (Number(s.amount) || 0);
        });

        expensesRes.data.forEach(e => {
            const d = new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            if (Object.prototype.hasOwnProperty.call(dailyData, d)) dailyData[d] -= (Number(e.amount) || 0);
        });

        const sortedData = Object.entries(dailyData).reverse().map(([date, profit]) => ({
            date,
            profit
        }));

        res.status(200).json(sortedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDataStats = async (req, res) => {
    try {
        const { businessId } = req.query;
        console.log(`[getDataStats] Request for businessId: ${businessId}`);

        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);

        // Debug Auth
        const hasToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer');
        console.log(`[getDataStats] Auth Token Present: ${hasToken}`);

        // Helper for independent fetch to avoid one failure blocking all
        const fetchStat = async (table, dateCol) => {
            try {
                // Get count
                const countQuery = await db.from(table).select('*', { count: 'exact', head: true }).eq('business_id', businessId);
                const count = countQuery.count || 0;

                // Get latest date (optimize by selecting only date column)
                const dateQuery = await db.from(table).select(dateCol).eq('business_id', businessId).order(dateCol, { ascending: false }).limit(1).maybeSingle();
                const lastDate = dateQuery.data ? dateQuery.data[dateCol] : null;

                console.log(`[getDataStats] ${table}: ${count} records, lastUpdated: ${lastDate}`);
                return { count, lastUpdated: lastDate };
            } catch (e) {
                console.error(`[getDataStats] Error fetching ${table}:`, e);
                return { count: 0, lastUpdated: null };
            }
        };

        const [sales, expenses, inventory, receivables] = await Promise.all([
            fetchStat('sales', 'date'),
            fetchStat('expenses', 'date'),
            fetchStat('inventory', 'created_at'),
            fetchStat('receivables', 'invoice_date')
        ]);

        res.status(200).json({
            sales,
            expenses,
            inventory,
            receivables
        });
    } catch (error) {
        console.error('[getDataStats] Fatal Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getSituationRoomData = async (req, res) => {
    try {
        const { businessId, range = 'week' } = req.query;
        if (!businessId) return res.status(400).json({ message: "Business ID required" });

        const db = getDbClient(req);
        const now = new Date();

        // Define ranges for Velocity & Burn
        let currentStart = new Date();
        let prevStart = new Date();
        let burnDivisor = 1;

        if (range === 'today') {
            currentStart.setHours(0, 0, 0, 0); // Start of today
            prevStart.setDate(now.getDate() - 1); prevStart.setHours(0, 0, 0, 0); // Start of yesterday
            burnDivisor = 1;
        } else if (range === 'month') {
            currentStart.setDate(now.getDate() - 30);
            prevStart.setDate(now.getDate() - 60);
            burnDivisor = 30;
        } else { // week (default)
            currentStart.setDate(now.getDate() - 7);
            prevStart.setDate(now.getDate() - 14);
            burnDivisor = 7;
        }

        // Parallel Fetch
        const [salesAll, expensesAll, receivablesPending] = await Promise.all([
            db.from('sales').select('amount, date').eq('business_id', businessId),
            db.from('expenses').select('amount, date').eq('business_id', businessId),
            db.from('receivables').select('*').eq('business_id', businessId).eq('status', 'Pending')
        ]);

        if (salesAll.error) throw salesAll.error;
        if (expensesAll.error) throw expensesAll.error;
        if (receivablesPending.error) throw receivablesPending.error;

        // 1. Current Cash Position (All Time)
        const totalSales = salesAll.data.reduce((sum, s) => sum + (s.amount || 0), 0);
        const totalExpenses = expensesAll.data.reduce((sum, e) => sum + (e.amount || 0), 0);
        const currentCash = totalSales - totalExpenses;

        // 2. Range-Specific Logic
        // Velocity: Current Period Exp vs Previous Period Exp
        const currentExp = expensesAll.data
            .filter(e => new Date(e.date) >= currentStart)
            .reduce((sum, e) => sum + (e.amount || 0), 0);

        const prevExp = expensesAll.data
            .filter(e => {
                const d = new Date(e.date);
                return d >= prevStart && d < currentStart;
            })
            .reduce((sum, e) => sum + (e.amount || 0), 0);

        let velChange = 0;
        let velTrend = 'stable';
        if (prevExp > 0) {
            velChange = Math.round(((currentExp - prevExp) / prevExp) * 100);
            velTrend = velChange > 0 ? 'increasing' : 'decreasing';
        } else if (currentExp > 0) {
            velChange = 100;
            velTrend = 'increasing';
        }

        // Burn for this range (averaged per day)
        // For 'today', it's just today's expense. For 'week', avg daily over last 7 days.
        const dailyBurn = Math.round(currentExp / burnDivisor);

        // Runway (Global metric, usually based on 30-day burn, but let's use the current range's daily burn for responsiveness)
        const runwayDays = dailyBurn > 0 ? Math.floor(currentCash / dailyBurn) : (currentCash > 0 ? 999 : 0);

        // 3. Next Event (Always global / future looking)
        let nextEvent = null;
        const overdue = receivablesPending.data
            .filter(r => new Date(r.expected_payment_date) < now)
            .sort((a, b) => b.amount_due - a.amount_due);

        if (overdue.length > 0) {
            const top = overdue[0];
            const days = Math.floor((now - new Date(top.expected_payment_date)) / (1000 * 60 * 60 * 24));
            nextEvent = {
                title: `Collect from ${top.customer_name}`,
                subtitle: `${days} days overdue`,
                date: top.expected_payment_date,
                amount: top.amount_due,
                type: 'asset'
            };
        } else {
            // Projected Burn
            const nextDate = new Date();
            nextDate.setDate(now.getDate() + 7);
            nextEvent = {
                title: `Projected Burn (${burnDivisor} Days)`,
                subtitle: 'Based on current velocity',
                date: nextDate.toISOString(),
                amount: dailyBurn * 7,
                type: 'liability'
            };
        }

        res.status(200).json({
            currentCash,
            dailyBurn,
            runwayDays,
            velocity: {
                change: Math.abs(velChange),
                trend: velTrend
            },
            nextEvent
        });
    } catch (error) {
        console.error("Situation Room Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSales,
    getExpenses,
    getInventory,
    getReceivables,
    getMetrics,
    getTopDebtors,
    getRecentTransactions,
    getDailyProfit,
    getDataStats,
    getSituationRoomData
};
