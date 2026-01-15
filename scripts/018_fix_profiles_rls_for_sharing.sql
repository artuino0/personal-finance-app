-- Fix RLS policies for profiles table to allow viewing shared user profiles
-- This allows users to see the profiles of people they share data with

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new policy that allows viewing own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow viewing profiles of users who share their data with you
CREATE POLICY "Users can view profiles of account owners who share with them"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT owner_id 
      FROM public.account_shares 
      WHERE shared_with_id = auth.uid() AND is_active = true
    )
  );

-- Create policy to allow viewing profiles of users you share your data with
CREATE POLICY "Users can view profiles of people they share with"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT shared_with_id 
      FROM public.account_shares 
      WHERE owner_id = auth.uid() AND is_active = true
    )
  );
