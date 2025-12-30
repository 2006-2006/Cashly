export const calculateForecast = (
    currentCash,
    sales,
    expenses,
    receivables,
    inventory,
    recurring = [],
    modifications = {},
    days = 30
) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentSales = sales.filter(s => new Date(s.date) >= ninetyDaysAgo);
    const totalRecentSales = recentSales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    // Improved Average Calc: Base it on actual data span (max 90 days)
    const salesDates = recentSales.map(s => new Date(s.date));
    const salesSpan = salesDates.length > 0
        ? Math.max(7, Math.ceil((new Date() - new Date(Math.min(...salesDates))) / (1000 * 60 * 60 * 24)))
        : 90;
    const averageDailySales = totalRecentSales / Math.min(90, salesSpan);

    const recentExpenses = expenses.filter(e => new Date(e.date) >= ninetyDaysAgo);
    const totalRecentExpenses = recentExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const expDates = recentExpenses.map(e => new Date(e.date));
    const expSpan = expDates.length > 0
        ? Math.max(7, Math.ceil((new Date() - new Date(Math.min(...expDates))) / (1000 * 60 * 60 * 24)))
        : 90;
    const averageDailyExpenses = totalRecentExpenses / Math.min(90, expSpan);

    let runningCash = Number(currentCash);
    const forecastData = [];
    let lowestBalance = runningCash;
    let lowestBalanceDate = new Date();
    const causes = new Set();
    const isSimulation = !!modifications;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days + (isSimulation ? 30 : 0));

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Modification parsers
    const {
        globalInventoryDelayDays = 0,
        globalReceivablesAcceleratePercent = 0,
        salesGrowthPercent = 0,
        expenseCutPercent = 0
    } = modifications || {};

    let activeReceivables = receivables.map(r => ({ ...r, amountDue: r.amount_due || r.amountDue || r.amount }));
    let activeInventory = inventory.map(i => ({ ...i, reorderCost: i.reorder_cost || i.reorderCost || i.amount }));

    // Apply Global Mods
    if (globalReceivablesAcceleratePercent) {
        const percent = globalReceivablesAcceleratePercent / 100;
        let collectedNow = 0;
        activeReceivables = activeReceivables.map(r => {
            const amount = r.amountDue || 0;
            const collect = amount * percent;
            collectedNow += collect;
            return { ...r, amountDue: amount - collect };
        });
        runningCash += collectedNow;
    }

    if (globalInventoryDelayDays) {
        activeInventory = activeInventory.map(inv => {
            const currentDue = new Date(inv.expected_payment_date || inv.expectedPaymentDate || new Date());
            const newDate = new Date(currentDue);
            newDate.setDate(newDate.getDate() + globalInventoryDelayDays);
            return { ...inv, expectedPaymentDate: newDate };
        });
    }

    for (let i = 1; i <= days; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);

        // INFLOWS
        let dailyInflow = averageDailySales; // Baseline

        // Apply sales growth
        if (salesGrowthPercent) {
            dailyInflow = dailyInflow * (1 + salesGrowthPercent / 100);
        }

        // Receivables (Explicit)
        const dayReceivables = activeReceivables.filter(r => {
            const rDate = new Date(r.expected_payment_date || r.expectedPaymentDate || r.invoiceDate);
            return isSameDay(rDate, currentDate);
        });
        const receivablesAmount = dayReceivables.reduce((sum, r) => sum + (r.amountDue || 0), 0);
        dailyInflow += receivablesAmount;

        // Recurring Income
        recurring.forEach(rec => {
            if (rec.type === 'Income' && rec.active) {
                const nextRun = new Date(rec.next_run_date || rec.nextRunDate);
                if (currentDate.getDate() === nextRun.getDate()) {
                    dailyInflow += (rec.amount || 0);
                }
            }
        });

        // OUTFLOWS
        // Baseline Burn (Historical Average)
        let dailyOutflow = averageDailyExpenses;

        // Inventory Payments (Explicit)
        const dayInventory = activeInventory.filter(inv => {
            const iDate = new Date(inv.expected_payment_date || inv.expectedPaymentDate || inv.purchaseDate);
            return isSameDay(iDate, currentDate);
        });
        const inventoryAmount = dayInventory.reduce((sum, inv) => sum + (inv.reorderCost || 0), 0);
        dailyOutflow += inventoryAmount;

        // Future Expenses (Explicit from 'expenses' array if future dated)
        // Note: Usually 'expenses' array is historical. If user manually entered future expenses, they would appear here.
        // To avoid double counting (Average + Explicit), we generally assume Average COVERS standard ops, and explicit are Extra.
        // However, specifically for this implementation, we will treat explicit future expenses as overrides/additions.
        const dayExpenses = expenses.filter(e => {
            const eDate = new Date(e.date);
            return isSameDay(eDate, currentDate);
        });
        const explicitExpenseAmount = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
        dailyOutflow += explicitExpenseAmount;

        // Apply expense cut (to the baseline portion mainly, but let's apply to total for simplicity of simulation)
        if (expenseCutPercent) {
            dailyOutflow = dailyOutflow * (1 - expenseCutPercent / 100);
        }

        // Recurring Expenses
        recurring.forEach(rec => {
            if (rec.type === 'Expense' && rec.active) {
                const nextRun = new Date(rec.next_run_date || rec.nextRunDate);
                if (currentDate.getDate() === nextRun.getDate()) {
                    dailyOutflow += (rec.amount || 0);
                }
            }
        });

        // Update Cash
        runningCash = runningCash + dailyInflow - dailyOutflow;

        if (runningCash < lowestBalance) {
            lowestBalance = runningCash;
            lowestBalanceDate = new Date(currentDate);
        }

        if (runningCash < 0) {
            if (inventoryAmount > 0) causes.add("Inventory Payment");
            if (dailyOutflow > dailyInflow) causes.add("High Burn Rate");
        }

        forecastData.push({
            day: i,
            date: currentDate.toISOString(),
            predictedCashBalance: Math.round(runningCash),
            inflows: Math.round(dailyInflow),
            outflows: Math.round(dailyOutflow)
        });
    }

    // Health Score Calculation
    const healthScore = calculateHealthScoreLocal(forecastData);

    // Summary
    const netBurn = forecastData.reduce((s, d) => s + d.outflows, 0) - forecastData.reduce((s, d) => s + d.inflows, 0);
    const avgBurn = netBurn > 0 ? (netBurn / days) : 0;
    const runwayDays = avgBurn > 0 ? Math.floor(currentCash / avgBurn) : 999;

    return {
        data: forecastData,
        runwayDays: (runningCash < 0) ? 0 : runwayDays, // If already negative, 0 runway
        lowestBalance,
        lowestBalanceDate,
        causes: Array.from(causes),
        healthDetails: healthScore
    };
};

const calculateHealthScoreLocal = (forecast) => {
    // 0. Safety Check: Data density check
    const totalDataPoints = forecast.length;
    const totalIn = forecast.reduce((s, f) => s + f.inflows, 0);
    const totalOut = forecast.reduce((s, f) => s + f.outflows, 0);
    const startBalance = forecast[0]?.predictedCashBalance || 0;

    if (!forecast || forecast.length === 0 || (totalIn === 0 && totalOut === 0)) {
        return {
            score: 0,
            status: 'No Data',
            insights: ['Upload sales or expenses to see your health score.'],
            components: { runway: 0, negativeDays: 0, volatility: 0 }
        };
    }

    let score = 85; // Base score for a working business
    const insights = [];

    // 1. Negative Days (Critical Risk)
    const negativeDays = forecast.filter(f => f.predictedCashBalance < 0).length;
    if (negativeDays > 0) {
        const penalty = Math.min(negativeDays * 10, 60);
        score -= penalty;
        insights.push(`⚠️ Critical: Cash balance predicted to be negative for ${negativeDays} days.`);
    }

    // 2. Runway Analysis
    const avgBurn = (totalOut - totalIn) / totalDataPoints;
    const runway = avgBurn > 0 ? Math.floor(startBalance / avgBurn) : 999;

    if (runway < 15) {
        score -= 40;
        insights.push('⏰ Emergency: You have less than 15 days of cash remaining.');
    } else if (runway < 30) {
        score -= 20;
        insights.push(`⚠️ Caution: Cash runway is low (${runway} days).`);
    } else if (runway >= 90) {
        score += 5; // Bonus for stability
        insights.push('✅ Strong cash buffer (90+ days runway).');
    }

    // 3. Profitability (Sales vs Expenses)
    const profitMargin = totalIn > 0 ? ((totalIn - totalOut) / totalIn) * 100 : -100;
    if (profitMargin < 0) {
        score -= 15;
        insights.push(`💸 Burning cash: Expenses are exceeding sales by ${Math.abs(Math.round(profitMargin))}%`);
    } else if (profitMargin > 20) {
        score += 10;
        insights.push('📈 Healthy profit margins detected.');
    }

    // 4. Volatility (Spiky outflows)
    const avgDailyOut = totalOut / totalDataPoints;
    const highOutflowDays = forecast.filter(f => f.outflows > avgDailyOut * 3).length;
    if (highOutflowDays > 2) {
        score -= 10;
        insights.push('📊 High spending volatility detected.');
    }

    // Final Status Assignment
    let status = 'Healthy';
    if (score < 40) status = 'Critical';
    else if (score < 70) status = 'Warning';

    // Caps
    score = Math.min(100, Math.max(0, Math.round(score)));

    if (insights.length === 0) {
        insights.push("✨ Neutral: Business performance is steady.");
    }

    return {
        score,
        status,
        insights: insights.slice(0, 3), // Top 3 most important
        components: {
            runway,
            negativeDays,
            volatility: highOutflowDays
        }
    };
};
