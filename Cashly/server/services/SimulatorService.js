const supabase = require('../config/supabase');

class SimulatorService {
    /**
     * Simulates a large purchase and its impact on cash flow.
     */
    static async simulatePurchase(businessId, { amount, paymentMethod = 'Cash', months = 1 }) {
        const { data: sales } = await supabase.from('sales').select('*').eq('business_id', businessId);
        const { data: expenses } = await supabase.from('expenses').select('*').eq('business_id', businessId);

        const salesData = sales || [];
        const expensesData = expenses || [];

        const avgMonthlySales = salesData.reduce((sum, s) => sum + s.amount, 0) / 3; // Approx 3 months of data
        const avgMonthlyExpenses = expensesData.reduce((sum, e) => sum + e.amount, 0) / 3;

        let monthlyImpact = 0;
        if (paymentMethod === 'Cash') {
            monthlyImpact = amount;
        } else {
            // EMI simulation (approx 1% interest pm)
            const r = 0.01;
            monthlyImpact = (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
        }

        const currentRunway = (avgMonthlySales - avgMonthlyExpenses);
        const newRunway = currentRunway - (paymentMethod === 'Cash' ? 0 : monthlyImpact);
        const upfrontImpact = paymentMethod === 'Cash' ? amount : (amount / 10); // 10% downpayment simulation

        let verdict = 'YES';
        let riskScore = 0;

        if (upfrontImpact > (avgMonthlySales * 2)) {
            verdict = 'HIGH RISK';
            riskScore = 0.8;
        } else if (newRunway < (avgMonthlySales * 0.1)) {
            verdict = 'CAUTION';
            riskScore = 0.5;
        }

        return {
            verdict,
            riskScore,
            monthlyImpact: Math.round(monthlyImpact),
            upfrontImpact: Math.round(upfrontImpact),
            daysToRecover: Math.round(amount / Math.max(1, currentRunway / 30)),
            recommendation: verdict === 'YES' ? 'Purchase is feasible.' : 'Consider EMI or delaying the purchase.'
        };
    }

    /**
     * Calculates break-even and stabilization timeline.
     */
    static async calculateBreakEven(businessId) {
        const { data: sales } = await supabase.from('sales').select('*').eq('business_id', businessId);
        const { data: expenses } = await supabase.from('expenses').select('*').eq('business_id', businessId);

        const salesData = sales || [];
        const expensesData = expenses || [];

        const totalSales = salesData.reduce((sum, s) => sum + s.amount, 0);
        const totalExpenses = expensesData.reduce((sum, e) => sum + e.amount, 0);

        if (totalSales > totalExpenses) {
            return { stabilized: true, daysToBreakEven: 0, status: 'Currently profitable' };
        }

        const monthlyBurn = (totalExpenses - totalSales) / 3;
        const trend = 0.1; // Assume 10% monthly growth for simulation

        let months = 0;
        let currentSales = totalSales / 3;
        let currentExpenses = totalExpenses / 3;

        while (currentSales < currentExpenses && months < 24) {
            currentSales *= (1 + trend);
            months++;
        }

        return {
            stabilized: months < 24,
            daysToBreakEven: months * 30,
            requiredSalesGrowth: '10% monthly',
            targetMonthlySales: Math.round(currentExpenses)
        };
    }
}

module.exports = SimulatorService;
