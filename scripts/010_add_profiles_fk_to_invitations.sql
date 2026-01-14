-- Add foreign key relationship from share_invitations to profiles
-- This allows Supabase to automatically join profiles data

-- First, ensure owner_id matches users in profiles
alter table public.share_invitations
  add constraint share_invitations_owner_profile_fkey 
  foreign key (owner_id) 
  references public.profiles(id) 
  on delete cascade;

-- Add index for better query performance
create index if not exists share_invitations_owner_profile_idx 
  on public.share_invitations(owner_id);
