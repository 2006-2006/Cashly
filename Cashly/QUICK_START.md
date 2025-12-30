# 🚀 Quick Start - Upload Test Data

## ✅ Files Ready in `server/test/`
- sales_data.xlsx (323 records)
- expenses_data.xlsx (195 records)
- inventory_data.xlsx (42 records)
- receivables_data.xlsx (23 records)

---

## 🎯 Option 1: Auto-Upload (Recommended)

One command to upload everything:

```bash
cd server
node scripts/autoUploadTestData.js
```

**Result:** All data uploaded automatically. Login with:
- Email: `test@cashly.com`
- Password: `test123456`

---

## 🎯 Option 2: Manual Upload via Dashboard

1. **Start the application** (if not running):
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev
   
   # Terminal 2 - Client
   cd client
   npm run dev
   ```

2. **Open browser:** http://localhost:5173

3. **Register/Login** to your account

4. **Navigate to Upload Data page**

5. **Upload files:**
   - Click each file picker
   - Select from `server/test/` directory
   - Click "Upload All Files"

6. **View results:**
   - Go to Dashboard → see forecast with real data
   - Go to Income → see 323 sales
   - Go to Expenses → see 195 expenses
   - Try AI Analysis → get insights

---

## 📊 What You'll See

### Dashboard
- Current Health: **Safe** (profitable)
- Cash Runway: **30+** days  
- Forecast Chart: **Blue area chart** with cash flow

### Income Page
- Total Sales: **~₹3,000,000**
- Daily Average: **~₹33,000**
- 323 transactions listed

### Expenses Page
- Total Expenses: **~₹1,800,000**
- Daily Average: **~₹20,000**
- 195 transactions with categories

### AI Analysis
- Click any pre-built prompt
- Get intelligent recommendations
- Ask custom questions

---

## ⚡ Quick Test Commands

```bash
# 1. Generate fresh data
cd server
node scripts/generateTestData.js

# 2. Auto-upload to database
node scripts/autoUploadTestData.js

# 3. Open dashboard
# Browser: http://localhost:5173
# Login: test@cashly.com / test123456
```

---

## 🔍 Verify Upload

After uploading, check:

1. **Dashboard loads** with forecast data
2. **Income page shows 323 records**
3. **Expenses page shows 195 records**
4. **Charts display** properly
5. **AI Analysis responds** to queries

---

## 💡 Tips

- **First time?** Use auto-upload script
- **Want fresh data?** Re-run `generateTestData.js`
- **Multiple users?** Each gets their own data
- **Simulations?** Try "Delay Payables" or "
Collect Receivables" on Dashboard

---

**🎉 You're all set! Your Cashly is ready with 3 months of test data!**
