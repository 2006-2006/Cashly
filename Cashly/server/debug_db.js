require('dotenv').config();
const supabase = require('./config/supabase');

async function debugDB() {
    console.log("--- DB DEBUG START ---");

    // 1. List Businesses
    const { data: businesses, error: bError } = await supabase.from('businesses').select('*');
    if (bError) console.error("Business Fetch Error:", bError);
    else {
        console.log(`Found ${businesses.length} businesses:`);
        businesses.forEach(b => console.log(` - [${b.id}] ${b.name} (User: ${b.user_id})`));
    }

    // 2. List Recent Sales
    const { data: sales, error: sError } = await supabase.from('sales').select('*').order('created_at', { ascending: false }).limit(5);
    if (sError) console.error("Sales Fetch Error:", sError);
    else {
        console.log(`\nRecent 5 Sales:`);
        sales.forEach(s => console.log(` - [${s.business_id}] ${s.date} : ${s.amount} (${s.description})`));
    }

    // 3. List Recent Expenses
    const { data: exp, error: eError } = await supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(5);
    if (eError) console.error("Expense Fetch Error:", eError);
    else {
        console.log(`\nRecent 5 Expenses:`);
        exp.forEach(e => console.log(` - [${e.business_id}] ${e.date} : ${e.amount} (${e.description})`));
    }
    console.log("--- DB DEBUG END ---");
}

debugDB();
