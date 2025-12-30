-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Users Table (Managed by Supabase Auth, but we can add a profile wrapper if needed)
-- We'll try to keep it simple and rely on auth.users mostly, but 'businesses' links to auth.users.id

-- 2. Businesses Table
create table if not exists public.businesses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  currency text default 'INR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Sales Table
create table if not exists public.sales (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null, -- optional redundancy for easier RLS
  amount numeric not null default 0,
  description text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  payment_type text default 'Cash', -- Cash, UPI, Card, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Expenses Table
create table if not exists public.expenses (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric not null default 0,
  category text default 'General',
  description text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Inventory Table
create table if not exists public.inventory (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_name text not null,
  quantity numeric default 0,
  unit_cost numeric default 0,
  total_cost numeric default 0, -- Store calculated value or compute on fly
  reorder_cost numeric default 0, -- For forecasting
  purchase_date timestamp with time zone default timezone('utc'::text, now()),
  expected_payment_date timestamp with time zone, -- If bought on credit
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Receivables Table (Invoices / Credit Given)
create table if not exists public.receivables (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_name text not null,
  amount_due numeric not null default 0,
  invoice_date timestamp with time zone default timezone('utc'::text, now()),
  expected_payment_date timestamp with time zone,
  paid_date timestamp with time zone, -- NEW: For tracking payment history/delays
  status text default 'Pending', -- Pending, Paid, Overdue
  customer_email text, -- For reminders
  customer_phone text, -- For WhatsApp reminders
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Recurring Table (Subscriptions, Rent, EMI)
create table if not exists public.recurring (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  amount numeric not null default 0,
  type text not null check (type in ('Income', 'Expense')),
  frequency text default 'Monthly', -- Monthly, Weekly, Yearly
  next_run_date timestamp with time zone,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Daily Briefs (AI Generated History)
create table if not exists public.daily_briefs (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  date timestamp with time zone default timezone('utc'::text, now()),
  content jsonb, -- Stores the full AI summary helper object
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(business_id, date) -- One brief per day per business
);

-- 9. Insights (AI Risk Analysis)
create table if not exists public.insights (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  type text not null, -- Risk, Opportunity, Anomaly
  severity text default 'Medium',
  title text,
  description text,
  is_dismissed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Alerts (System Notifications)
create table if not exists public.alerts (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  type text not null,
  severity text default 'low',
  title text not null,
  message text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS) POLICIES
-- This ensures users can ONLY see their own data.

alter table public.businesses enable row level security;
create policy "Users can view own businesses" on public.businesses
  for select using (auth.uid() = user_id);
create policy "Users can insert own businesses" on public.businesses
  for insert with check (auth.uid() = user_id);
create policy "Users can update own businesses" on public.businesses
  for update using (auth.uid() = user_id);
create policy "Users can delete own businesses" on public.businesses
  for delete using (auth.uid() = user_id);

alter table public.sales enable row level security;
create policy "Users can all on sales" on public.sales
  for all using (auth.uid() = user_id);

alter table public.expenses enable row level security;
create policy "Users can all on expenses" on public.expenses
  for all using (auth.uid() = user_id);

alter table public.inventory enable row level security;
create policy "Users can all on inventory" on public.inventory
  for all using (auth.uid() = user_id);

alter table public.receivables enable row level security;
create policy "Users can all on receivables" on public.receivables
  for all using (auth.uid() = user_id);

alter table public.recurring enable row level security;
create policy "Users can all on recurring" on public.recurring
  for all using (auth.uid() = user_id || business_id in (select id from public.businesses where user_id = auth.uid())); 
  -- Simple fallback if user_id is missing in recurring, check business ownership

alter table public.daily_briefs enable row level security;
create policy "Users can all on daily_briefs" on public.daily_briefs
  for all using (business_id in (select id from public.businesses where user_id = auth.uid()));

alter table public.insights enable row level security;
create policy "Users can all on insights" on public.insights
  for all using (business_id in (select id from public.businesses where user_id = auth.uid()));

alter table public.alerts enable row level security;
create policy "Users can all on alerts" on public.alerts
  for all using (business_id in (select id from public.businesses where user_id = auth.uid()));

-- Functions/Triggers (Optional but good for automation)

-- Auto-update 'updated_at' columns if we had them
-- create or replace function update_modified_column()
-- returns trigger as $$
-- begin
--    new.updated_at = now();
--    return new;
-- end;
-- $$ language 'plpgsql';
