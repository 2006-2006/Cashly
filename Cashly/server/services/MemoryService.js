const BusinessMemory = require('../models/BusinessMemory');

class MemoryService {
    /**
     * Stores a new memory for the business.
     */
    static async rememberEvent(businessId, eventData) {
        return await BusinessMemory.create({
            business: businessId,
            ...eventData
        });
    }

    /**
     * Retrieves memories relevant to a date range.
     */
    static async getRelevantMemories(businessId, date) {
        const month = date.getMonth();
        // Check for recurring seasonal events in this month
        const memories = await BusinessMemory.find({
            business: businessId,
            autoApply: true
        }).lean();

        return memories.filter(m => m.date.getMonth() === month);
    }

    /**
     * Detects owner's decision style based on history.
     */
    static async getDecisionStyle(userId) {
        // Detect: Risk-averse vs Aggressive
        // Placeholder: Logic would analyze scenario assumptions
        return {
            style: 'Aggressive-Growth',
            description: 'You tend to favor higher sales targets and expansion.',
            adjustment: 'AI will highlight risks more prominently to balance your style.'
        };
    }
}

module.exports = MemoryService;
