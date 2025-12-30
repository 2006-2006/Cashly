
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Try to find a service key for admin access, otherwise fall back to anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Key used starts with:', supabaseKey.substring(0, 10));
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- DEBUG START ---');

    // 1. Check connection and list businesses
    console.log('1. Fetching Businesses...');
    const { data: businesses, error: busError } = await supabase.from('businesses').select('*');
    if (busError) {
        console.error('Error fetching businesses:', busError);
        return;
    }
    console.log(`Found ${businesses.length} businesses.`);
    businesses.forEach(b => console.log(` - ID: ${b.id}, Name: ${b.name}`));

    if (businesses.length === 0) {
        console.log('NO BUSINESSES FOUND. This explains why tools return empty.');
        return;
    }

    const businessId = businesses[0].id;
    console.log(`\n2. Testing getSalesData for BusinessID: ${businessId}`);

    // 2. Test Sales Query manually
    const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('business_id', businessId)
        .limit(5);

    if (salesError) {
        console.error('Error fetching sales:', salesError);
    } else {
        console.log(`Found ${sales.length} sales records.`);
        if (sales.length > 0) console.log('Sample:', sales[0]);
    }

    console.log('--- DEBUG END ---');
}

debug();
