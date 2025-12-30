-- ==========================================
-- CASHLY: FULL DATABASE SETUP SCRIPT
-- ==========================================
-- Copy this entire content into Supabase > SQL Editor > Run
-- This script is safe to run multiple times (Idempotent)

-- 1. Enable necessary extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 2. Create the Businesses table
create table if not exists public.businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text check (type in ('Retail', 'Service', 'Manufacturing', 'Trading', 'Other')) default 'Retail',
  currency text default 'INR',
  fiscal_year_start text default '04-01',
  min_cash_buffer numeric default 10000,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Sales Table
create table if not exists public.sales (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  date timestamp with time zone not null,
  amount numeric not null,
  description text,
  payment_type text check (payment_type in ('Cash', 'UPI', 'Card', 'Credit')) default 'Cash',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create Expenses Table
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  date timestamp with time zone not null,
  amount numeric not null,
  category text default 'General',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Create Receivables Table (With All Columns)
create table if not exists public.receivables (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  customer_name text not null,
  amount_due numeric not null,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Apply Updates to Receivables (Safe to run if table exists)
ALTER TABLE public.receivables ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.receivables ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.receivables ADD COLUMN IF NOT EXISTS customer_photo text;
ALTER TABLE public.receivables ADD COLUMN IF NOT EXISTS invoice_date timestamp with time zone DEFAULT timezone('utc'::text, now());
ALTER TABLE public.receivables ADD COLUMN IF NOT EXISTS expected_payment_date timestamp with time zone;

-- 6. Create Inventory Table (With All Columns)
create table if not exists public.inventory (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  item_name text not null,
  quantity numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Apply Updates to Inventory (Safe to run if table exists)
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS total_cost numeric DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS unit_cost numeric DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS reorder_cost numeric DEFAULT 0;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS purchase_date timestamp with time zone DEFAULT timezone('utc'::text, now());
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS expected_payment_date timestamp with time zone;

-- 7. Enable Row Level Security (RLS)
alter table public.businesses enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.receivables enable row level security;
alter table public.inventory enable row level security;

-- 8. Create Security Policies
-- (We use DO blocks to avoid errors if policies already exist)

-- Businesses Policies
DO $$ BEGIN
  create policy "Allow owners to do everything on businesses"
  on public.businesses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sales Policies
DO $$ BEGIN
  create policy "Allow business owners to do everything on sales"
  on public.sales for all
  using (business_id in (select id from public.businesses where user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Expenses Policies
DO $$ BEGIN
  create policy "Allow business owners to do everything on expenses"
  on public.expenses for all
  using (business_id in (select id from public.businesses where user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Receivables Policies
DO $$ BEGIN
  create policy "Allow business owners to do everything on receivables"
  on public.receivables for all
  using (business_id in (select id from public.businesses where user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Inventory Policies
DO $$ BEGIN
  create policy "Allow business owners to do everything on inventory"
  on public.inventory for all
  using (business_id in (select id from public.businesses where user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
