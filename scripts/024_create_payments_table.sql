-- Create payments table to store transaction history
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_session_id TEXT NOT NULL UNIQUE,
    stripe_payment_intent_id TEXT,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    receipt_url TEXT,
    metadata JSONB
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payments" 
    ON public.payments 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Only service role can insert/update (handled by API)
CREATE POLICY "Service role can manage payments" 
    ON public.payments 
    FOR ALL 
    USING (auth.role() = 'service_role');
