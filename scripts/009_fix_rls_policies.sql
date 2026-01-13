-- Fix RLS policies to avoid querying auth.users directly
-- This resolves the "permission denied for table users" error

-- Drop the problematic policies
drop policy if exists "Invited users can view their invitations" on public.share_invitations;
drop policy if exists "Invited users can update invitation status" on public.share_invitations;

-- Recreate policies using JWT token email instead of querying auth.users
-- Use auth.jwt() to get email from session token instead of querying auth.users table
create policy "Invited users can view their invitations"
  on public.share_invitations for select
  using (
    invited_email = auth.jwt() ->> 'email'
  );

-- Use auth.jwt() for invited users to update their invitation status
create policy "Invited users can update invitation status"
  on public.share_invitations for update
  using (
    invited_email = auth.jwt() ->> 'email'
  );
