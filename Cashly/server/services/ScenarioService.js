const Scenario = require('../models/Scenario');

class ScenarioService {
    /**
     * Compares two scenarios and explains the difference.
     */
    static async compareScenarios(scenarioAId, scenarioBId) {
        const a = await Scenario.findById(scenarioAId);
        const b = await Scenario.findById(scenarioBId);

        if (!a || !b) return { error: 'One or both scenarios not found' };

        const diff = {
            salesGrowth: b.assumptions.salesGrowthPercent - a.assumptions.salesGrowthPercent,
            collectionDelay: b.assumptions.collectionDelayDays - a.assumptions.collectionDelayDays,
            expenseCut: b.assumptions.expenseCutPercent - a.assumptions.expenseCutPercent,
            healthScoreDiff: b.healthScore - a.healthScore
        };

        const mostImpactful = Object.entries(diff)
            .sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]))[0][0];

        return {
            diff,
            explanation: `Scenario "${b.name}" vs "${a.name}": The biggest driver is ${mostImpactful}. Resulting in a ${diff.healthScoreDiff > 0 ? 'gain' : 'loss'} of ${Math.abs(diff.healthScoreDiff)} points in health score.`,
            recommendation: diff.healthScoreDiff > 0 ? `Switching to ${b.name} assumptions is recommended.` : `Stick with ${a.name} for better stability.`
        };
    }

    /**
     * Solves for required assumptions to meet a goal.
     */
    static async solveForGoal(businessId, targetBuffer) {
        // Goal: "Never go below targetBuffer"
        // System calculates required sales growth or expense cuts

        // Mocking solver logic
        const requiredSalesGrowth = 15; // Placeholder
        const maxExpenses = 100000; // Placeholder

        return {
            goal: `Maintain minimum balance of ₹${targetBuffer.toLocaleString()}`,
            requiredSalesGrowth: `${requiredSalesGrowth}%`,
            maxExpensesAllowed: `₹${maxExpenses.toLocaleString()}`,
            collectionSpeedRequired: 'Must collect within 10 days of invoice'
        };
    }
}

module.exports = ScenarioService;
