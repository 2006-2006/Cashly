-- Copy this entire content
-- Go to your Supabase Dashboard -> SQL Editor -> New Query
-- Paste this and click RUN

-- 1. Enable necessary extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 2. Create the Businesses table (required for setup)
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

-- 3. Create Child Tables
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

create table if not exists public.receivables (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  customer_name text not null,
  amount_due numeric not null,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.inventory (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  item_name text not null,
  quantity numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
alter table public.businesses enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.receivables enable row level security;
alter table public.inventory enable row level security;

-- 5. Create Security Policies (Allow owners to do everything)

-- Businesses Policies
create policy "Allow owners to do everything on businesses"
on public.businesses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Sales Policies
create policy "Allow business owners to do everything on sales"
on public.sales
for all
using (business_id in (select id from public.businesses where user_id = auth.uid()))
with check (business_id in (select id from public.businesses where user_id = auth.uid()));

-- Expenses Policies
create policy "Allow business owners to do everything on expenses"
on public.expenses
for all
using (business_id in (select id from public.businesses where user_id = auth.uid()))
with check (business_id in (select id from public.businesses where user_id = auth.uid()));

-- Receivables Policies
create policy "Allow business owners to do everything on receivables"
on public.receivables
for all
using (business_id in (select id from public.businesses where user_id = auth.uid()))
with check (business_id in (select id from public.businesses where user_id = auth.uid()));

-- Inventory Policies
create policy "Allow business owners to do everything on inventory"
on public.inventory
for all
using (business_id in (select id from public.businesses where user_id = auth.uid()))
with check (business_id in (select id from public.businesses where user_id = auth.uid()));
