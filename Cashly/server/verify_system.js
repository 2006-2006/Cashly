require('dotenv').config();
const supabase = require('./config/supabase');

async function verifySystem() {
    console.log("--- SYSTEM VERIFICATION START ---");

    // 1. Check Tables Existence
    const tables = ['businesses', 'sales', 'expenses', 'inventory', 'receivables'];
    const results = {};
    let missingColumns = false;

    for (const table of tables) {
        try {
            // Try to select 1 row
            const { data, error } = await supabase.from(table).select('id').limit(1);
            if (error) {
                if (error.code === '42P01') {
                    results[table] = "❌ MISSING (Run CREATE_TABLES.sql)";
                    missingColumns = true;
                } else {
                    results[table] = `⚠️ ERROR: ${error.message}`;
                }
            } else {
                results[table] = "✅ EXISTS";
            }
        } catch (err) {
            results[table] = `❌ EXCEPTION: ${err.message}`;
        }
    }

    // 2. Deep Column Check
    console.log("\n--- COLUMN INTEGRITY CHECK ---");

    // Check Inventory Columns
    const { error: invError } = await supabase.from('inventory').select('total_cost, expected_payment_date').limit(1);
    if (invError) {
        console.log("❌ INVENTORY SCHEMA MISMATCH: Missing columns (total_cost, etc.)");
        missingColumns = true;
    } else {
        console.log("✅ INVENTORY SCHEMA: OK");
    }

    // Check Receivables Columns
    const { error: recError } = await supabase.from('receivables').select('customer_email, expected_payment_date').limit(1);
    if (recError) {
        console.log("❌ RECEIVABLES SCHEMA MISMATCH: Missing columns (customer_email, etc.)");
        missingColumns = true;
    } else {
        console.log("✅ RECEIVABLES SCHEMA: OK");
    }

    console.table(results);

    // 3. Report Status & Fix
    if (missingColumns) {
        console.log("\n⚠️ CRITICAL: DATABASE SCHEMA IS OUTDATED.");
        console.log("   The upload errors are caused by missing columns in your Supabase database.");
        console.log("   I cannot automatically alter your database structure.");
        console.log("\n   >>> ACTION REQUIRED: <<<");
        console.log("   1. Go to Supabase Dashboard -> SQL Editor");
        console.log("   2. Run the following SQL:");
        console.log(`
    ALTER TABLE public.inventory 
    ADD COLUMN IF NOT EXISTS total_cost numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS unit_cost numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reorder_cost numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS purchase_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS expected_payment_date timestamp with time zone;

    ALTER TABLE public.receivables 
    ADD COLUMN IF NOT EXISTS customer_email text,
    ADD COLUMN IF NOT EXISTS customer_phone text,
    ADD COLUMN IF NOT EXISTS customer_photo text,
    ADD COLUMN IF NOT EXISTS invoice_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS expected_payment_date timestamp with time zone;
        `);
    } else {
        console.log("\n🎉 GREAT NEWS: All database tables and columns are set up correctly!");
    }

    console.log("--- SYSTEM VERIFICATION END ---");
}

verifySystem();
