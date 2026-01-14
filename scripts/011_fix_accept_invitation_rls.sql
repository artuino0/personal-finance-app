-- Drop and recreate the RLS policy for account_shares to allow invited users to create their own shares
-- when they accept an invitation

drop policy if exists "Owners can create shares" on public.account_shares;

-- Only owners can create shares
create policy "Owners can create shares"
  on public.account_shares for insert
  with check (auth.uid() = owner_id);

-- Invited users can create shares when accepting an invitation
create policy "Invited users can accept invitations"
  on public.account_shares for insert
  with check (
    auth.uid() = shared_with_id and
    exists (
      select 1 from public.share_invitations
      where owner_id = account_shares.owner_id
        and invited_email = auth.jwt() ->> 'email'
        and status = 'pending'
    )
  );
