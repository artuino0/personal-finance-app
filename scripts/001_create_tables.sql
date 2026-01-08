-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create accounts table (bank accounts, credit cards, cash, etc.)
create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'credit_card', 'cash', 'investment')),
  balance numeric(15, 2) not null default 0,
  currency text not null default 'USD',
  color text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric(15, 2) not null,
  description text,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create credits/loans table
create table if not exists public.credits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('loan', 'credit_card', 'mortgage', 'personal_loan')),
  total_amount numeric(15, 2) not null,
  remaining_amount numeric(15, 2) not null,
  interest_rate numeric(5, 2),
  monthly_payment numeric(15, 2),
  due_date date,
  start_date date not null default current_date,
  end_date date,
  status text not null default 'active' check (status in ('active', 'paid', 'defaulted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create credit payments table
create table if not exists public.credit_payments (
  id uuid primary key default uuid_generate_v4(),
  credit_id uuid not null references public.credits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(15, 2) not null,
  payment_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.credits enable row level security;
alter table public.credit_payments enable row level security;

-- Create RLS policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create RLS policies for accounts
create policy "Users can view own accounts"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own accounts"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own accounts"
  on public.accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete own accounts"
  on public.accounts for delete
  using (auth.uid() = user_id);

-- Create RLS policies for categories
create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Create RLS policies for transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Create RLS policies for credits
create policy "Users can view own credits"
  on public.credits for select
  using (auth.uid() = user_id);

create policy "Users can insert own credits"
  on public.credits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own credits"
  on public.credits for update
  using (auth.uid() = user_id);

create policy "Users can delete own credits"
  on public.credits for delete
  using (auth.uid() = user_id);

-- Create RLS policies for credit_payments
create policy "Users can view own credit payments"
  on public.credit_payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own credit payments"
  on public.credit_payments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own credit payments"
  on public.credit_payments for update
  using (auth.uid() = user_id);

create policy "Users can delete own credit payments"
  on public.credit_payments for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists accounts_user_id_idx on public.accounts(user_id);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_account_id_idx on public.transactions(account_id);
create index if not exists transactions_date_idx on public.transactions(date);
create index if not exists categories_user_id_idx on public.categories(user_id);
create index if not exists credits_user_id_idx on public.credits(user_id);
create index if not exists credit_payments_credit_id_idx on public.credit_payments(credit_id);
