const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const generateData = () => {
    // 1. Sales Data
    const salesData = [];
    const date = new Date('2025-11-20'); // Start 30 days ago
    for (let i = 0; i < 30; i++) {
        salesData.push({
            Date: new Date(date),
            Amount: Math.floor(Math.random() * 5000) + 1000,
            'Payment Type': ['Cash', 'UPI', 'Card', 'Credit'][Math.floor(Math.random() * 4)]
        });
        date.setDate(date.getDate() + 1);
    }

    // 2. Expenses Data
    const expensesData = [
        { Date: new Date('2025-12-01'), 'Expense Type': 'Rent', Amount: 15000 },
        { Date: new Date('2025-12-05'), 'Expense Type': 'Electricity', Amount: 2000 },
        { Date: new Date('2025-12-10'), 'Expense Type': 'Salaries', Amount: 20000 },
        { Date: new Date('2025-12-25'), 'Expense Type': 'Maintenance', Amount: 5000 }
    ];

    // 3. Inventory Data
    const inventoryData = [
        { 'Item Name': 'Smartphones', 'Reorder Cost': 50000, 'Expected Payment Date': new Date('2025-12-22') }, // Imminent
        { 'Item Name': 'Laptops', 'Reorder Cost': 80000, 'Expected Payment Date': new Date('2025-12-28') },
        { 'Item Name': 'Accessories', 'Reorder Cost': 10000, 'Expected Payment Date': new Date('2026-01-05') }
    ];

    // 4. Receivables Data
    const receivablesData = [
        { 'Customer Name': 'John Doe', 'Invoice Date': new Date('2025-12-01'), 'Amount Due': 5000, 'Expected Payment Date': new Date('2025-12-21') },
        { 'Customer Name': 'Jane Smith', 'Invoice Date': new Date('2025-12-05'), 'Amount Due': 12000, 'Expected Payment Date': new Date('2025-12-23') }
    ];

    const workbook = XLSX.utils.book_new();

    const salesSheet = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales");

    const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, expensesSheet, "Expenses");

    const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory");

    const receivablesSheet = XLSX.utils.json_to_sheet(receivablesData);
    XLSX.utils.book_append_sheet(workbook, receivablesSheet, "Receivables");

    const outputPath = path.join(__dirname, '..', 'sample_msme_data.xlsx');
    XLSX.writeFile(workbook, outputPath);
    console.log(`Created sample data at ${outputPath}`);
};

generateData();
