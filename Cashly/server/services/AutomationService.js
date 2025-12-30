const AutomationRule = require('../models/AutomationRule');
const Alert = require('../models/Alert');
const Receivable = require('../models/Receivable');
const Business = require('../models/Business');

class AutomationService {
    /**
     * Scans for opportunities to automate actions.
     */
    static async suggestActions(businessId) {
        const suggestions = [];
        const business = await Business.findById(businessId);
        const rules = await AutomationRule.find({ business: businessId, isActive: true });

        // 1. Check for overdue payments
        const overdue = await Receivable.find({
            business: businessId,
            status: 'Overdue'
        });

        if (overdue.length > 0) {
            suggestions.push({
                type: 'PaymentReminder',
                title: 'Send Overdue Reminders',
                description: `You have ${overdue.length} overdue invoices. Suggest sending WhatsApp reminders.`,
                impact: 'High',
                action: 'Send WhatsApp'
            });
        }

        // 2. Check for Low Cash Buffer
        // This would normally check current balance, but we'll simulate based on receivables vs payables
        const minBuffer = business?.settings?.minCashBuffer || 0;
        // Mocking a low cash situation
        if (minBuffer > 50000) {
            suggestions.push({
                type: 'BufferEnforcement',
                title: 'Low Cash Buffer Warning',
                description: `Projected cash fall below your ₹${minBuffer.toLocaleString()} limit.`,
                impact: 'Critical',
                action: 'Reschedule Payables'
            });
        }

        return suggestions;
    }
}

module.exports = AutomationService;
