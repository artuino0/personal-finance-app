-- Create recurring services table
create table if not exists public.recurring_services (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('utilities', 'subscriptions', 'insurance', 'rent', 'other')),
  amount numeric(15, 2) not null,
  frequency text not null check (frequency in ('monthly', 'biweekly', 'weekly', 'yearly')),
  payment_day integer not null check (payment_day >= 1 and payment_day <= 31),
  next_payment_date date not null,
  account_id uuid references public.accounts(id) on delete set null,
  notes text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.recurring_services enable row level security;

-- Create RLS policies for recurring_services
create policy "Users can view own recurring services"
  on public.recurring_services for select
  using (auth.uid() = user_id);

create policy "Users can insert own recurring services"
  on public.recurring_services for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recurring services"
  on public.recurring_services for update
  using (auth.uid() = user_id);

create policy "Users can delete own recurring services"
  on public.recurring_services for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists recurring_services_user_id_idx on public.recurring_services(user_id);
create index if not exists recurring_services_next_payment_idx on public.recurring_services(next_payment_date);
