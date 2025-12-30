const RecurringTransaction = require('../models/RecurringTransaction');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const { checkBusinessAccess } = require('../utils/accessControl');

// @desc    Create recurring transaction rule
// @route   POST /api/recurring
// @access  Private
const createRecurring = async (req, res) => {
    try {
        const { businessId, type, category, amount, frequency, startDate, description } = req.body;

        await checkBusinessAccess(req.user, businessId);

        const nextRunDate = new Date(startDate); // Start immediately or on start date

        const recurring = await RecurringTransaction.create({
            user: req.user.id,
            business: businessId,
            type,
            category,
            amount,
            frequency,
            startDate,
            nextRunDate,
            description
        });

        res.status(201).json(recurring);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get recurring rules
// @route   GET /api/recurring
// @access  Private
const getRecurring = async (req, res) => {
    try {
        const { businessId } = req.query;
        await checkBusinessAccess(req.user, businessId);

        const rules = await RecurringTransaction.find({ business: businessId });
        res.status(200).json(rules);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Process recurring transactions
// @route   POST /api/recurring/process
// @access  Private
const processRecurring = async (req, res) => {
    try {
        const { businessId } = req.body;
        await checkBusinessAccess(req.user, businessId);

        const today = new Date();
        const rules = await RecurringTransaction.find({
            business: businessId,
            active: true,
            nextRunDate: { $lte: today }
        });

        let createdCount = 0;

        for (const rule of rules) {
            // Loop to catch up if missed multiple periods
            while (rule.nextRunDate <= today) {
                // Create transaction
                if (rule.type === 'Income') {
                    await Sale.create({
                        user: rule.user,
                        business: rule.business,
                        date: rule.nextRunDate,
                        amount: rule.amount,
                        description: rule.description || `Recurring Income: ${rule.category}`,
                        paymentType: 'Recurring' // Add this to Sale enum if strict
                    });
                } else {
                    await Expense.create({
                        user: rule.user,
                        business: rule.business,
                        date: rule.nextRunDate,
                        amount: rule.amount,
                        category: rule.category,
                        description: rule.description || `Recurring Expense: ${rule.category}`
                    });
                }

                // Calculate next run date
                const nextDate = new Date(rule.nextRunDate);
                if (rule.frequency === 'Daily') nextDate.setDate(nextDate.getDate() + 1);
                if (rule.frequency === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
                if (rule.frequency === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                if (rule.frequency === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

                rule.lastGeneratedDate = rule.nextRunDate;
                rule.nextRunDate = nextDate;
                createdCount++;

                // Safety break for infinite loops if logic fails
                if (createdCount > 1000) break;
            }
            await rule.save();
        }

        res.status(200).json({ message: `Processed ${createdCount} recurring transactions` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createRecurring,
    getRecurring,
    processRecurring
};
