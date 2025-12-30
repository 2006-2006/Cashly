const XLSX = require('xlsx');
const supabase = require('../config/supabase');
const { checkBusinessAccess } = require('../utils/accessControl');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper to parse date
const parseDate = (dateVal) => {
    if (!dateVal) return new Date();
    if (typeof dateVal === 'number') {
        return new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    }
    const parsed = new Date(dateVal);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// Helper to safely get number
const getNumber = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    const num = Number(String(val).replace(/[₹,\s]/g, ''));
    return isNaN(num) ? 0 : num;
};

// Helper to get string
const getString = (row, ...keys) => {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) {
            return String(row[key]).trim();
        }
    }
    return '';
};

const getDbClient = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer') && supabase.getAuthenticatedClient) {
        return supabase.getAuthenticatedClient(req.headers.authorization.split(' ')[1]);
    }
    return supabase;
};

const resolveBusinessId = async (req, dbClient) => {
    let businessId = req.body.businessId;
    if ((!businessId || businessId === 'undefined' || businessId === 'null') && req.user) {
        try {
            const { data } = await dbClient.from('businesses').select('id').eq('user_id', req.user.id).limit(1).maybeSingle();
            if (data) businessId = data.id;
            else {
                const { data: newBiz } = await dbClient.from('businesses').insert({
                    user_id: req.user.id, name: 'My Ledger', type: 'Retail', currency: 'INR'
                }).select().single();
                if (newBiz) businessId = newBiz.id;
            }
        } catch (e) { }
    }
    return businessId;
};

const uploadSales = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const dbClient = getDbClient(req);
        const businessId = await resolveBusinessId(req, dbClient);
        if (!businessId) return res.status(400).json({ message: 'Business ID is required.' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer', dense: true });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!data || data.length === 0) return res.status(400).json({ message: 'No data found' });

        const sales = data.map(row => ({
            business_id: businessId,
            date: parseDate(row['Date'] || row['date'] || row['DATE']),
            amount: getNumber(row['Amount'] || row['amount'] || row['Total']),
            description: getString(row, 'Description', 'Particulars', 'Reference') || 'Sale Credit',
            payment_type: (() => {
                const pt = getString(row, 'Payment Type', 'Mode').toLowerCase();
                if (pt.includes('upi') || pt.includes('gpay')) return 'UPI';
                if (pt.includes('card')) return 'Card';
                return 'Cash';
            })()
        })).filter(s => s.amount > 0);

        if (sales.length === 0) return res.status(400).json({ message: 'No valid sales records' });

        const { error } = await dbClient.from('sales').insert(sales);
        if (error) throw error;

        res.status(200).json({ message: `Uploaded ${sales.length} sales` });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Processing failed' });
    }
};

const uploadExpenses = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const dbClient = getDbClient(req);
        const businessId = await resolveBusinessId(req, dbClient);
        if (!businessId) return res.status(400).json({ message: 'Business ID is required' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer', dense: true });
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        if (!data || !data.length) return res.status(400).json({ message: 'No data' });

        const expenses = data.map(row => ({
            business_id: businessId,
            date: parseDate(row['Date'] || row['date']),
            amount: getNumber(row['Amount'] || row['amount'] || row['Total']),
            category: getString(row, 'Category', 'Type') || 'General',
            description: getString(row, 'Description', 'Particulars')
        })).filter(e => e.amount > 0);

        if (!expenses.length) return res.status(400).json({ message: 'No valid expenses' });

        const { error } = await dbClient.from('expenses').insert(expenses);
        if (error) throw error;

        res.status(200).json({ message: `Uploaded ${expenses.length} expenses` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const uploadInventory = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file' });
        const dbClient = getDbClient(req);
        const businessId = await resolveBusinessId(req, dbClient);
        if (!businessId) return res.status(400).json({ message: 'Business ID required' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer', dense: true });
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const inventory = data.map(row => ({
            business_id: businessId,
            item_name: getString(row, 'Item Name', 'Item', 'Product') || 'Item',
            quantity: getNumber(row['Quantity'] || row['Qty']) || 1,
            unit_cost: getNumber(row['Unit Cost'] || row['Price']),
            total_cost: getNumber(row['Total Cost'] || row['Total']),
            purchase_date: parseDate(row['Purchase Date'] || row['Date'])
        })).filter(i => i.item_name !== 'Item');

        if (!inventory.length) return res.status(400).json({ message: 'No valid inventory' });

        const { error } = await dbClient.from('inventory').insert(inventory);
        if (error) throw error;

        res.status(200).json({ message: `Uploaded ${inventory.length} items` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const uploadReceivables = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file' });
        const dbClient = getDbClient(req);
        const businessId = await resolveBusinessId(req, dbClient);
        if (!businessId) return res.status(400).json({ message: 'Business ID required' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer', dense: true });
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const receivables = data.map(row => ({
            business_id: businessId,
            customer_name: getString(row, 'Customer Name', 'Name') || 'Unknown',
            amount_due: getNumber(row['Amount Due'] || row['Amount'] || row['Due']),
            invoice_date: parseDate(row['Invoice Date'] || row['Date']),
            status: getString(row, 'Status') || 'Pending'
        })).filter(r => r.amount_due > 0);

        if (!receivables.length) return res.status(400).json({ message: 'No valid receivables' });

        const { error } = await dbClient.from('receivables').insert(receivables);
        if (error) throw error;

        res.status(200).json({ message: `Uploaded ${receivables.length} receivables` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const analyzeImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

        const dbClient = getDbClient(req);
        const finalBusinessId = await resolveBusinessId(req, dbClient);
        if (!finalBusinessId) return res.status(400).json({ message: 'Business ID is required' });

        // AI Processing
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        let extractedData = null;
        let isDemo = false;

        if (apiKey) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const imagePart = {
                    inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype },
                };
                const prompt = `Extract financial data. Return JSON Array: [{ "type": "Sale"|"Expense", "date": "YYYY-MM-DD", "amount": number, "description": "text", "category": "text", "paymentType": "Cash"|"Online" }]`;

                console.log(`[AI SCAN] Processing...`);
                const result = await model.generateContent([prompt, imagePart]);
                const text = result.response.text();
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) extractedData = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error("AI Scan Error:", e.message);
            }
        }

        if (!extractedData) {
            isDemo = true;
            extractedData = [{
                type: "Expense", date: new Date().toISOString(), amount: 1500, description: "Demo Scan", category: "General", paymentType: "Cash"
            }];
        }

        const salesPayloads = [];
        const expensesPayloads = [];

        for (const item of extractedData) {
            const payload = {
                business_id: finalBusinessId,
                date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
                amount: Number(item.amount) || 0,
                description: item.description || 'Scanned Item'
            };
            if (payload.amount <= 0) continue;

            if (item.type === 'Sale') {
                payload.payment_type = item.paymentType || 'Cash';
                salesPayloads.push(payload);
            } else {
                payload.category = item.category || 'General';
                expensesPayloads.push(payload);
            }
        }

        const promises = [];
        if (salesPayloads.length) promises.push(dbClient.from('sales').insert(salesPayloads).select());
        if (expensesPayloads.length) promises.push(dbClient.from('expenses').insert(expensesPayloads).select());

        const results = await Promise.all(promises);
        const savedCount = results.reduce((acc, r) => acc + (r.data ? r.data.length : 0), 0);

        res.status(200).json({
            message: `Scanned and saved ${savedCount} items.`,
            data: extractedData,
            isDemo
        });

    } catch (error) {
        console.error('Scan Error:', error.message);
        res.status(500).json({ message: `Scan failed: ${error.message}` });
    }
};

module.exports = {
    uploadSales,
    uploadExpenses,
    uploadInventory,
    uploadReceivables,
    analyzeImage
};
