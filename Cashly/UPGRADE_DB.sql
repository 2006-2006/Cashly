-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX "MISSING COLUMN" ERRORS

-- 1. Add missing columns to INVENTORY table
alter table public.inventory add column if not exists unit_cost numeric default 0;
alter table public.inventory add column if not exists total_cost numeric default 0;
alter table public.inventory add column if not exists reorder_cost numeric default 0;
alter table public.inventory add column if not exists purchase_date timestamp with time zone default now();
alter table public.inventory add column if not exists expected_payment_date timestamp with time zone;

-- 2. Add missing columns to RECEIVABLES table
alter table public.receivables add column if not exists customer_email text;
alter table public.receivables add column if not exists customer_phone text;
alter table public.receivables add column if not exists customer_photo text;
alter table public.receivables add column if not exists invoice_date timestamp with time zone default now();
alter table public.receivables add column if not exists expected_payment_date timestamp with time zone;

-- 3. (Optional) Add user_id if you really want it, but it's redundant. 
-- Better to NOT add it and let the backend align with the schema.
-- (The backend fix I am applying right now will remove the need for user_id in these tables)
