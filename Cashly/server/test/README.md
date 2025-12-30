# Test Data Files - 3 Months Business Data

This directory contains sample Excel files with 90 days of realistic business data for testing Cashly.

## Files Overview

### 1. **sales_data.xlsx** (323 records)
Daily sales transactions for 90 days.

**Columns:**
- `Date` - Transaction date (YYYY-MM-DD)
- `Description` - Sale description
- `Amount` - Sale amount in ₹

**Pattern:**
- 3-5 sales per weekday
- 2-4 sales per weekend
- Amount range: ₹5,000 - ₹15,000 per transaction

---

### 2. **expenses_data.xlsx** (195 records)
Daily business expenses including fixed and variable costs.

**Columns:**
- `Date` - Expense date (YYYY-MM-DD)
- `Category` - Expense category
- `Description` - Expense description  
- `Amount` - Expense amount in ₹

**Categories:**
- Rent (Monthly - ₹25,000)
- Salaries (Bi-monthly - ₹35,000)
- Utilities
- Inventory Purchase
- Marketing
- Transportation
- Office Supplies
- Miscellaneous

---

### 3. **inventory_data.xlsx** (42 records)
Inventory purchases with payment schedules.

**Columns:**
- `Purchase Date` - When inventory was purchased
- `Item Name` - Product name
- `Quantity` - Number of units
- `Unit Cost` - Cost per unit in ₹
- `Total Cost` - Total purchase cost
- `Expected Payment Date` - When payment is due (30-60 days from purchase)

**Items:**
- Electronics (Laptops, Phones, Tablets, etc.)
- Quantity: 5-15 units per order
- Payment terms: 30-60 days

---

### 4. **receivables_data.xlsx** (23 records)
Outstanding customer invoices.

**Columns:**
- `Invoice Date` - When invoice was created
- `Customer Name` - Customer company name
- `Amount Due` - Outstanding amount in ₹
- `Expected Payment Date` - Expected collection date (15-45 days from invoice)
- `Status` - Payment status (Pending/Paid)

**Customers:**
- Various B2B clients
- Invoice amounts: ₹20,000 - ₹50,000
- Payment terms: 15-45 days

---

## How to Upload

### Option 1: Via Dashboard Upload Page
1. Login to Cashly
2. Go to **Upload Data** page
3. Select and upload each file
4. Click **Upload All Files**

### Option 2: Using Auto-Upload Script
```bash
node scripts/autoUploadTestData.js
```

---

## Expected Results After Upload

### Dashboard Should Show:
- **Current Cash**: Based on uploaded transactions
- **30-Day Forecast**: Projected cash flow
- **Risk Level**: Safe/Warning/Critical based on data
- **Charts**: Visual representation of cash balance over time

### Pages Should Display:
- **Income Page**: 323 sales transactions
- **Expenses Page**: 195 expense records
- **Dashboard Charts**: Real forecast based on uploaded data

---

## Data Characteristics

**Total Sales (90 days):** ~₹2,800,000 - ₹3,200,000
**Total Expenses (90 days):** ~₹1,500,000 - ₹2,000,000
**Net Cash Flow:** Profitable (~₹1,000,000+ surplus)

**Receivables Outstanding:** ~₹450,000 - ₹550,000
**Inventory Payables:** ~₹1,800,000 - ₹2,200,000

This creates a realistic cash flow scenario where:
- Business is profitable
- Has outstanding receivables to collect
- Has inventory payments due (working capital management needed)
- Demonstrates the need for cash flow forecasting
