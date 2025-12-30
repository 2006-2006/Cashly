const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create test directory
const testDir = path.join(__dirname, '..', 'test');
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
}

// Helper to generate dates for last 90 days
const generateDates = (days = 90) => {
    const dates = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }
    return dates;
};

// Format date as YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Generate Sales Data (90 days of daily sales)
const generateSalesData = () => {
    const dates = generateDates();
    const salesData = [];

    dates.forEach((date, index) => {
        // Base daily sales: 15,000 to 45,000 with weekly patterns
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // 3-5 sales per day
        const numSales = isWeekend ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < numSales; i++) {
            const baseAmount = isWeekend ? 5000 : 8000;
            const amount = baseAmount + Math.floor(Math.random() * 7000);

            salesData.push({
                'Date': formatDate(date),
                'Description': `Sale #${salesData.length + 1}`,
                'Amount': amount
            });
        }
    });

    return salesData;
};

// Generate Expenses Data (90 days)
const generateExpensesData = () => {
    const dates = generateDates();
    const expensesData = [];

    const categories = ['Rent', 'Utilities', 'Salaries', 'Inventory Purchase', 'Marketing', 'Transportation', 'Office Supplies', 'Miscellaneous'];

    dates.forEach((date) => {
        const dayOfMonth = date.getDate();

        // Rent on 1st of month
        if (dayOfMonth === 1) {
            expensesData.push({
                'Date': formatDate(date),
                'Category': 'Rent',
                'Description': 'Monthly Rent',
                'Amount': 25000
            });
        }

        // Salaries on 1st and 15th
        if (dayOfMonth === 1 || dayOfMonth === 15) {
            expensesData.push({
                'Date': formatDate(date),
                'Category': 'Salaries',
                'Description': 'Staff Salaries',
                'Amount': 35000
            });
        }

        // Random daily expenses (1-3 per day)
        const numExpenses = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numExpenses; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const amount = category === 'Inventory Purchase' ?
                Math.floor(Math.random() * 15000) + 10000 :
                Math.floor(Math.random() * 3000) + 500;

            expensesData.push({
                'Date': formatDate(date),
                'Category': category,
                'Description': `${category} expense`,
                'Amount': amount
            });
        }
    });

    return expensesData;
};

// Generate Inventory Data
const generateInventoryData = () => {
    const dates = generateDates();
    const inventoryData = [];

    const items = [
        'Laptop Dell XPS',
        'Mobile Phone Samsung',
        'Tablet iPad',
        'Headphones Sony',
        'Smart Watch',
        'Camera Canon',
        'Printer HP',
        'Monitor LG'
    ];

    dates.forEach((date, index) => {
        // 2-3 inventory purchases per week
        if (index % 3 === 0) {
            const numItems = Math.floor(Math.random() * 2) + 1;

            for (let i = 0; i < numItems; i++) {
                const item = items[Math.floor(Math.random() * items.length)];
                const quantity = Math.floor(Math.random() * 10) + 5;
                const unitCost = Math.floor(Math.random() * 5000) + 15000;
                const totalCost = quantity * unitCost;

                // Payment due in 30-60 days
                const paymentDate = new Date(date);
                paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 30) + 30);

                inventoryData.push({
                    'Purchase Date': formatDate(date),
                    'Item Name': item,
                    'Quantity': quantity,
                    'Unit Cost': unitCost,
                    'Total Cost': totalCost,
                    'Expected Payment Date': formatDate(paymentDate)
                });
            }
        }
    });

    return inventoryData;
};

// Generate Receivables Data (Outstanding invoices)
const generateReceivablesData = () => {
    const dates = generateDates();
    const receivablesData = [];

    const customers = [
        'ABC Corp',
        'XYZ Ltd',
        'Tech Solutions',
        'Retail Store',
        'Online Shop',
        'Business Center',
        'Enterprise Inc',
        'Smart Systems'
    ];

    dates.forEach((date, index) => {
        // 1-2 receivables per week
        if (index % 4 === 0) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const amount = Math.floor(Math.random() * 30000) + 20000;

            // Payment expected in 15-45 days
            const expectedDate = new Date(date);
            expectedDate.setDate(expectedDate.getDate() + Math.floor(Math.random() * 30) + 15);

            receivablesData.push({
                'Invoice Date': formatDate(date),
                'Customer Name': customer,
                'Amount Due': amount,
                'Expected Payment Date': formatDate(expectedDate),
                'Status': 'Pending'
            });
        }
    });

    return receivablesData;
};

// Create Excel files
console.log('Generating sample data files...\n');

// Sales
const salesData = generateSalesData();
const salesWB = XLSX.utils.book_new();
const salesWS = XLSX.utils.json_to_sheet(salesData);
XLSX.utils.book_append_sheet(salesWB, salesWS, 'Sales');
XLSX.writeFile(salesWB, path.join(testDir, 'sales_data.xlsx'));
console.log(`✓ Generated sales_data.xlsx with ${salesData.length} records`);

// Expenses
const expensesData = generateExpensesData();
const expensesWB = XLSX.utils.book_new();
const expensesWS = XLSX.utils.json_to_sheet(expensesData);
XLSX.utils.book_append_sheet(expensesWB, expensesWS, 'Expenses');
XLSX.writeFile(expensesWB, path.join(testDir, 'expenses_data.xlsx'));
console.log(`✓ Generated expenses_data.xlsx with ${expensesData.length} records`);

// Inventory
const inventoryData = generateInventoryData();
const inventoryWB = XLSX.utils.book_new();
const inventoryWS = XLSX.utils.json_to_sheet(inventoryData);
XLSX.utils.book_append_sheet(inventoryWB, inventoryWS, 'Inventory');
XLSX.writeFile(inventoryWB, path.join(testDir, 'inventory_data.xlsx'));
console.log(`✓ Generated inventory_data.xlsx with ${inventoryData.length} records`);

// Receivables
const receivablesData = generateReceivablesData();
const receivablesWB = XLSX.utils.book_new();
const receivablesWS = XLSX.utils.json_to_sheet(receivablesData);
XLSX.utils.book_append_sheet(receivablesWB, receivablesWS, 'Receivables');
XLSX.writeFile(receivablesWB, path.join(testDir, 'receivables_data.xlsx'));
console.log(`✓ Generated receivables_data.xlsx with ${receivablesData.length} records`);

console.log(`\n✅ All files created in: ${testDir}`);
console.log('\nFile Summary:');
console.log(`- Sales: ${salesData.length} transactions`);
console.log(`- Expenses: ${expensesData.length} transactions`);
console.log(`- Inventory: ${inventoryData.length} purchases`);
console.log(`- Receivables: ${receivablesData.length} invoices`);
