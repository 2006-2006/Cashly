const supabase = require('../config/supabase');

class PredictiveService {
    /**
     * Predicts customer payment delay based on historical behavior.
     * @param {string} businessId 
     * @param {string} customerName 
     */
    static async predictPaymentDelay(businessId, customerName) {
        // Get historical paid invoices for this customer
        const { data: history, error } = await supabase
            .from('receivables')
            .select('*')
            .eq('business_id', businessId)
            .eq('customer_name', customerName)
            .eq('status', 'Paid')
            .not('paid_date', 'is', null)
            .not('expected_payment_date', 'is', null);

        if (error || !history || history.length === 0) {
            return { probability: 0.1, predictedDaysDelay: 0, confidence: 'low' };
        }

        let totalDelayDays = 0;
        let lateCount = 0;

        history.forEach(inv => {
            const expected = new Date(inv.expected_payment_date || inv.expectedPaymentDate);
            const actual = new Date(inv.paid_date || inv.paidDate);
            const delay = Math.max(0, Math.ceil((actual - expected) / (1000 * 60 * 60 * 24)));

            totalDelayDays += delay;
            if (delay > 0) lateCount++;
        });

        const avgDelay = totalDelayDays / history.length;
        const probability = lateCount / history.length;

        return {
            probability: Math.round(probability * 100) / 100,
            predictedDaysDelay: Math.round(avgDelay),
            confidence: history.length > 5 ? 'high' : 'medium'
        };
    }

    /**
     * Analyzes expenses for potential shocks.
     * Uses rolling variance and anomaly detection.
     */
    static async predictExpenseShocks(businessId) {
        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('business_id', businessId)
            .order('date', { ascending: true });

        if (error || !expenses || expenses.length < 10) return { risk: 'low', reason: 'Insufficient data' };

        // Group by month
        const monthlyTotals = {};
        expenses.forEach(e => {
            const d = e.date ? new Date(e.date) : new Date();
            const month = d.toISOString().substring(0, 7);
            monthlyTotals[month] = (monthlyTotals[month] || 0) + (e.amount || 0);
        });

        const totals = Object.values(monthlyTotals);
        const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
        const variance = totals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / totals.length;
        const stdDev = Math.sqrt(variance);

        // Check recent trend (last 30 days)
        const last30Days = expenses.filter(e => {
            const days = (new Date() - new Date(e.date)) / (1000 * 60 * 60 * 24);
            return days <= 30;
        });

        const recentTotal = last30Days.reduce((a, b) => a + (b.amount || 0), 0);

        return {
            risk: recentTotal > mean + stdDev ? 'high' : 'low',
            probability: recentTotal > mean + stdDev ? 0.8 : 0.1,
            reason: recentTotal > mean + stdDev ? 'Recent spending is significantly above historical average.' : 'Spending consistent with history.',
            forecast: {
                bestCase: Math.round(mean - stdDev),
                averageCase: Math.round(mean),
                worstCase: Math.round(mean + stdDev + (recentTotal > mean ? recentTotal - mean : 0))
            }
        };
    }
}

module.exports = PredictiveService;
