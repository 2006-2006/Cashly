# 🎉 Cashly - Complete Data Flow System

## ✅ What Has Been Built

### 1. **Sample Data Generation (3 Months)**
Location: `server/test/`

**Excel Files Created:**
- ✅ `sales_data.xlsx` - 323 daily sales transactions
- ✅ `expenses_data.xlsx` - 195 expense records  
- ✅ `inventory_data.xlsx` - 42 inventory purchases
- ✅ `receivables_data.xlsx` - 23 customer invoices

**Data Covers:** Last 90 days (3 months) of realistic daily business operations

---

### 2. **Complete Data Flow Architecture**

```
Excel Files (Test Data)
    ↓
Frontend Upload Page
    ↓
Backend Upload API (/api/upload/{type})
    ↓
Data Processing & Validation
    ↓
MongoDB Database
    ↓
Backend Data APIs (/api/data/{type})
    ↓
Frontend Pages (Dashboard, Income, Expenses)
    ↓
Real-time Charts & Analytics
```

---

### 3. **Backend Processing Engines**

#### **Upload Processing Engine**
- **Location:** `server/routes/uploadRoutes.js`
- **Handles:** CSV & Excel file uploads
- **Validates:** Data format, required fields
- **Processes:** Parses files and bulk inserts to database

#### **Forecast Engine**
- **Location:** `server/controllers/forecastController.js`
- **Processes:**
  - Current cash balance
  - Upcoming revenue (sales + receivables)
  - Upcoming expenses (expenses + inventory payments)
  - 30-day cash flow projection
  - Risk assessment (Safe/Warning/High Risk/Critical)
  - Runway calculation

#### **AI Analysis Engine**
- **Location:** `server/controllers/aiController.js`
- **Powered by:** Google Gemini API
- **Features:**
  - Risk explanation
  - General business queries
  - Pre-built analysis prompts
  - Indian MSME context

#### **Data Retrieval Engine**
- **Location:** `server/routes/dataRoutes.js`
- **Endpoints:**
  - `GET /api/data/sales` - Fetch all sales
  - `GET /api/data/expenses` - Fetch all expenses
  - `GET /api/data/inventory` - Fetch inventory purchases
  - `GET /api/data/receivables` - Fetch outstanding invoices

---

### 4. **Frontend Data Display**

#### **Dashboard** (`/dashboard`)
- Fetches: Forecast data (`POST /api/forecast/run`)
- Displays:
  - Current Health status
  - Cash Runway (days)
  - Lowest Balance projection
  - 30-Day Forecast Chart
  - AI Advisory
  - Quick Simulations

#### **Income Page** (`/income`)
- Fetches: `GET /api/data/sales`
- Displays:
  - Total Sales (30d)
  - Average Daily Income
  - Transaction count
  - Detailed sales table

#### **Expenses Page** (`/expenses`)
- Fetches: `GET /api/data/expenses`
- Displays:
  - Total Expenses (30d)
  - Average Daily Expense
  - Category breakdown
  - Detailed expense table

#### **Upload Page** (`/upload`)
- Allows: File uploads for all data types
- Sends: `POST /api/upload/{sales|expenses|inventory|receivables}`

#### **AI Analysis Page** (`/ai-analysis`)
- Fetches: `POST /api/ai/query`
- Features:
  - 6 pre-built prompts
  - Custom query input
  - Chat interface
  - Context-aware responses

---

## 🚀 How to Use

### Method 1: Auto-Upload (Fastest)
```bash
cd server
node scripts/autoUploadTestData.js
```

### Method 2: Manual Upload
1. Login to Cashly
2. Navigate to **Upload Data** page
3. Upload files from `server/test/` directory:
   - sales_data.xlsx
   - expenses_data.xlsx
   - inventory_data.xlsx
   - receivables_data.xlsx
4. Click **Upload All Files**

### Method 3: Re-Generate Data
```bash
cd server
node scripts/generateTestData.js
node scripts/autoUploadTestData.js
```

---

## 📊 Expected Results

After uploading, you should see:

### Dashboard:
- **Current Health:** Safe (profitable business)
- **Cash Runway:** 30+ days
- **Lowest Balance:** ~₹100,000
- **Chart:** Blue area chart showing cash flow trend

### Income Page:
- **Total Sales:** ~₹2,800,000 - ₹3,200,000
- **Avg Daily Income:** ~₹31,000 - ₹36,000
- **Transactions:** 323 records

### Expenses Page:
- **Total Expenses:** ~₹1,500,000 - ₹2,000,000
- **Avg Daily Expense:** ~₹17,000 - ₹22,000
- **Transactions:** 195 records

### AI Analysis:
- Click any pre-built prompt
- Get intelligent business insights
- Ask custom questions

---

## 🔧 Technical Details

### Database Schema
- **Sales:** `{ date, description, amount, user }`
- **Expenses:** `{ date, category, description, amount, user }`
- **Inventory:** `{ purchaseDate, itemName, quantity, unitCost, totalCost, expectedPaymentDate, user }`
- **Receivables:** `{ invoiceDate, customerName, amountDue, expectedPaymentDate, status, user }`

### API Endpoints Summary
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users/register` | POST | User registration |
| `/api/users/login` | POST | User login |
| `/api/upload/sales` | POST | Upload sales data |
| `/api/upload/expenses` | POST | Upload expenses data |
| `/api/upload/inventory` | POST | Upload inventory data |
| `/api/upload/receivables` | POST | Upload receivables data |
| `/api/data/sales` | GET | Fetch all sales |
| `/api/data/expenses` | GET | Fetch all expenses |
| `/api/forecast/run` | POST | Run cash flow forecast |
| `/api/ai/explain` | POST | Get AI risk explanation |
| `/api/ai/query` | POST | Ask AI questions |

---

## 🎯 Test Credentials

After running auto-upload:
- **Email:** test@cashly.com
- **Password:** test123456

---

## ✨ Key Features Operational

✅ Complete data upload system
✅ Excel/CSV file processing
✅ MongoDB data storage
✅ Real-time forecast engine
✅ AI-powered insights (Gemini API)
✅ Interactive dashboard charts
✅ Income & Expense tracking
✅ Working capital management
✅ Cash runway calculation
✅ Risk assessment algorithms
✅ Simulation capabilities

---

## 📝 Notes

- All data is user-specific (protected by JWT authentication)
- Forecast updates automatically when new data is uploaded
- Charts use Recharts for responsive visualization
- AI responses use Indian business context (₹, GST, MSME)
- Data persists in MongoDB Atlas
- Frontend auto-refreshes on data changes

---

**🚀 Your Cashly application is now fully operational with complete data flow from Excel files to live dashboard!**
