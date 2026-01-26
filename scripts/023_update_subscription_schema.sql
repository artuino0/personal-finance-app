-- Update subscription_tier to include premium
-- Add Stripe customer tracking fields

-- Drop existing constraint and recreate with premium tier
alter table public.profiles 
drop constraint if exists profiles_subscription_tier_check;

alter table public.profiles 
add constraint profiles_subscription_tier_check 
check (subscription_tier in ('free', 'pro', 'premium'));

-- Add Stripe customer and subscription tracking
alter table public.profiles 
add column if not exists stripe_customer_id text unique;

alter table public.profiles 
add column if not exists stripe_subscription_id text unique;

alter table public.profiles 
add column if not exists subscription_status text default 'inactive'
check (subscription_status in ('active', 'inactive', 'canceled', 'past_due', 'trialing'));

-- Create indexes for better performance
create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);
create index if not exists profiles_stripe_subscription_id_idx on public.profiles(stripe_subscription_id);
create index if not exists profiles_subscription_status_idx on public.profiles(subscription_status);

-- Update existing profiles to have proper status
update public.profiles 
set subscription_status = 'inactive'
where subscription_status is null and subscription_tier = 'free';

update public.profiles 
set subscription_status = 'active'
where subscription_status is null and subscription_tier in ('pro', 'premium');
