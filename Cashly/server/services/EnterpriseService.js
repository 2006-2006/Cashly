const AuditLog = require('../models/AuditLog');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

class EnterpriseService {
    /**
     * Detects suspicious edits or manipulation of data.
     */
    static async detectFraud(businessId) {
        const logs = await AuditLog.find({ business: businessId, action: 'Update' }).lean();

        const suspiciousActivities = [];

        // Check for multiple edits to the same record within a short time
        const editGroups = {};
        logs.forEach(log => {
            const key = log.entityId.toString();
            if (!editGroups[key]) editGroups[key] = [];
            editGroups[key].push(log);
        });

        Object.entries(editGroups).forEach(([id, edits]) => {
            if (edits.length > 5) {
                suspiciousActivities.push({
                    type: 'Frequent-Edits',
                    entityId: id,
                    count: edits.length,
                    severity: 'Medium',
                    reason: 'Record edited more than 5 times. Possible data manipulation.'
                });
            }
        });

        // Check for round number sales (unusual for real retail)
        const sales = await Sale.find({ business: businessId }).lean();
        if (sales.length > 0) {
            const roundSales = sales.filter(s => s.amount % 1000 === 0 && s.amount > 0);
            if (roundSales.length / sales.length > 0.5) {
                suspiciousActivities.push({
                    type: 'Pattern-Inconsistency',
                    severity: 'High',
                    reason: 'High percentage of perfectly rounded sales. Could indicate manual estimation instead of actual records.'
                });
            }
        }

        return suspiciousActivities;
    }

    /**
     * White-label branding helper.
     */
    static async getBranding(businessId) {
        // Mocking white-label config
        return {
            mode: 'Standard', // or 'CA-Firm'
            primaryColor: '#2563eb',
            logo: null,
            brandName: 'Cashly'
        };
    }
}

module.exports = EnterpriseService;
