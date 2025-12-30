-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX UPLOAD ERRORS

-- 1. Fix 'inventory' table columns
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS total_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS expected_payment_date timestamp with time zone;

-- 2. Fix 'receivables' table columns
ALTER TABLE public.receivables
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_photo text,
ADD COLUMN IF NOT EXISTS invoice_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS expected_payment_date timestamp with time zone;

-- 3. Verify changes (This is a comment, checking output isn't possible in pure SQL exec except via inspection)
-- Columns added:
-- Inventory: total_cost, unit_cost, reorder_cost, purchase_date, expected_payment_date
-- Receivables: customer_email, customer_phone, customer_photo, invoice_date, expected_payment_date
