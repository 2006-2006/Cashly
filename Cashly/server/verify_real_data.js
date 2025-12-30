const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
// CRITICAL: Use Service Role Key to bypass RLS and see ACTUAL data
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
    console.log('--- TRUE DATA VERIFICATION (Bypassing RLS) ---');

    // 1. Check Businesses
    const { data: businesses, error: bError } = await supabase.from('businesses').select('*');
    if (bError) console.error('Error fetching businesses:', bError.message);
    console.log(`\n🏢 Businesses Found: ${businesses?.length || 0}`);
    if (businesses?.length > 0) {
        businesses.forEach(b => console.log(`   - ID: ${b.id} | Name: ${b.name} | User: ${b.user_id}`));
    }

    // 2. Check Sales
    const { data: sales, error: sError } = await supabase.from('sales').select('count', { count: 'exact', head: true });
    console.log(`\n📈 Total Sales Records: ${sales?.length === undefined ? 'Unknown' : sales.length} (Count query: ${checkCount(sales)})`);
    // Note: supabase-js v1 vs v2 count syntax differs, let's just grab 5 rows
    const { data: salesRows } = await supabase.from('sales').select('id, amount, date').limit(5);
    console.log(`   Sample Sales: ${salesRows?.length} rows found.`);

    // 3. Check Expenses
    const { data: expenses } = await supabase.from('expenses').select('id, amount').limit(5);
    console.log(`\n📉 Sample Expenses: ${expenses?.length} rows found.`);

    console.log('\n--- VERIFICATION COMPLETE ---');
}

function checkCount(data) {
    return data ? 'Data matches' : 'No data';
}

checkData();
