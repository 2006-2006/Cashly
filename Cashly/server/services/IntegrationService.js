const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const BankAccount = require('../models/BankAccount');

class IntegrationService {
    /**
     * Reconciles bank transactions with record uploads.
     */
    static async reconcileBank(bankAccountId) {
        const bank = await BankAccount.findById(bankAccountId);
        if (!bank) return { reconciled: 0, mismatches: 0 };

        let reconciledCount = 0;
        let mismatchCount = 0;

        for (const tx of bank.transactions) {
            if (tx.isVerified) continue;

            // Simple match by amount and date (within 1 day)
            const dateWindow = {
                $gte: new Date(new Date(tx.date).setDate(new Date(tx.date).getDate() - 1)),
                $lte: new Date(new Date(tx.date).setDate(new Date(tx.date).getDate() + 1))
            };

            const record = tx.type === 'Credit'
                ? await Sale.findOne({ amount: tx.amount, date: dateWindow })
                : await Expense.findOne({ amount: tx.amount, date: dateWindow });

            if (record) {
                tx.isVerified = true;
                tx.matchedRecordId = record._id;
                reconciledCount++;
            } else {
                mismatchCount++;
            }
        }

        await bank.save();
        return { reconciled: reconciledCount, mismatches: mismatchCount };
    }

    /**
     * Calculates estimated GST liability for the current month.
     */
    static async estimateGST(businessId) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const sales = await Sale.find({
            business: businessId,
            date: { $gte: startOfMonth }
        }).lean();

        const expenses = await Expense.find({
            business: businessId,
            date: { $gte: startOfMonth }
        }).lean();

        const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        const gstRate = 0.18;
        const outputGst = totalSales * gstRate;
        const inputTaxCredit = totalExpenses * gstRate;

        const netPayable = Math.max(0, outputGst - inputTaxCredit);

        return {
            month: startOfMonth.toLocaleString('default', { month: 'long' }),
            totalSales,
            totalExpenses,
            outputGst: Math.round(outputGst),
            inputTaxCredit: Math.round(inputTaxCredit),
            netPayable: Math.round(netPayable),
            formatted: `Estimated GST for ${startOfMonth.toLocaleString('default', { month: 'long' })}: ₹${Math.round(netPayable).toLocaleString('en-IN')} (Output: ₹${Math.round(outputGst).toLocaleString('en-IN')}, ITC: ₹${Math.round(inputTaxCredit).toLocaleString('en-IN')}). Due by 20th next month.`
        };
    }
}

module.exports = IntegrationService;
