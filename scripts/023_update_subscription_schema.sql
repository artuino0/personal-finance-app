-- Add Stripe-related columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due'));

-- Update existing subscription_tier column to support premium
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'pro', 'premium'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Add subscription_ends_at column to track when subscription expires
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payment management';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN profiles.subscription_ends_at IS 'Timestamp when subscription ends or renews';
