-- Add subscription_tier column to profiles table
-- This determines which AI analysis tier the user has access to

alter table public.profiles 
add column if not exists subscription_tier text not null default 'free' 
check (subscription_tier in ('free', 'pro'));

-- Create index for better performance
create index if not exists profiles_subscription_tier_idx on public.profiles(subscription_tier);

-- Update existing profiles to have 'free' tier (if column was just added)
update public.profiles 
set subscription_tier = 'free' 
where subscription_tier is null;
