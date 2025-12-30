const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Receivable = require('../models/Receivable');

class IntelligenceService {
    /**
     * Generates data for Relationship Graph.
     */
    static async getRelationshipGraph(businessId) {
        // Get all unique customers (from Sales and Receivables)
        const sales = await Sale.find({ business: businessId }).lean();
        const receivables = await Receivable.find({ business: businessId }).lean();

        const customers = {};
        sales.forEach(s => {
            const name = s.description || 'Unknown Customer';
            customers[name] = (customers[name] || 0) + s.amount;
        });

        const nodeData = [];
        const links = [];

        // Center node
        nodeData.push({ id: 'Business', label: 'My Business', type: 'business', size: 50 });

        Object.entries(customers).forEach(([name, total]) => {
            const rec = receivables.find(r => r.customerName === name);
            const risk = rec && rec.status === 'Overdue' ? 'high' : 'low';

            nodeData.push({
                id: name,
                label: name,
                type: 'customer',
                size: Math.min(40, 10 + (total / 10000)),
                riskLevel: risk,
                totalVolume: total
            });

            links.push({ source: 'Business', target: name, value: total });
        });

        return { nodes: nodeData, links };
    }

    /**
     * Calculates Dependency Risk (Concentration Index).
     */
    static async getDependencyRisk(businessId) {
        const sales = await Sale.find({ business: businessId }).lean();
        if (sales.length === 0) return { score: 0, status: 'Safe' };

        const customerSales = {};
        sales.forEach(s => {
            const name = s.description || 'General';
            customerSales[name] = (customerSales[name] || 0) + s.amount;
        });

        const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
        const shares = Object.values(customerSales).map(v => v / totalSales);

        if (shares.length === 0) return { hhi: 0, topCustomerDependency: 0, status: 'Safe' };

        // HHI (Herfindahl-Hirschman Index) - sum of squares of market shares
        const hhi = shares.reduce((sum, s) => sum + (s * s), 0);

        // Top Customer Dependency
        const topCustomerShare = Math.max(...shares);

        let status = 'Safe';
        if (topCustomerShare > 0.5) status = 'Critical';
        else if (topCustomerShare > 0.3) status = 'Warning';

        return {
            hhi: Math.round(hhi * 100) / 100,
            topCustomerDependency: Math.round(topCustomerShare * 100),
            status,
            recommendation: status !== 'Safe' ? 'Diversify your customer base to reduce dependency risk.' : 'Customer base is well diversified.'
        };
    }
}

module.exports = IntelligenceService;
