-- Create account shares table for tracking shared access
create table if not exists public.account_shares (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  shared_with_id uuid not null references auth.users(id) on delete cascade,
  shared_with_email text not null,
  shared_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(owner_id, shared_with_id)
);

-- Create permissions table for granular access control
create table if not exists public.share_permissions (
  id uuid primary key default uuid_generate_v4(),
  share_id uuid not null references public.account_shares(id) on delete cascade,
  resource_type text not null check (resource_type in ('accounts', 'transactions', 'credits', 'services', 'categories')),
  can_view boolean not null default false,
  can_create boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(share_id, resource_type)
);

-- Create share invitations table for pending invitations
create table if not exists public.share_invitations (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invited_email text not null,
  invitation_token uuid not null default uuid_generate_v4() unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  -- Store permissions as JSON for pending invitations
  permissions jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default timezone('utc'::text, now() + interval '7 days') not null,
  accepted_at timestamp with time zone,
  unique(owner_id, invited_email)
);

-- Enable Row Level Security
alter table public.account_shares enable row level security;
alter table public.share_permissions enable row level security;
alter table public.share_invitations enable row level security;

-- RLS Policies for account_shares
-- Owner can view all their shares
create policy "Owners can view their shares"
  on public.account_shares for select
  using (auth.uid() = owner_id);

-- Shared users can view shares where they are the recipient
create policy "Shared users can view shares with them"
  on public.account_shares for select
  using (auth.uid() = shared_with_id);

-- Only owners can create shares
create policy "Owners can create shares"
  on public.account_shares for insert
  with check (auth.uid() = owner_id);

-- Only owners can update their shares
create policy "Owners can update their shares"
  on public.account_shares for update
  using (auth.uid() = owner_id);

-- Only owners can delete their shares
create policy "Owners can delete their shares"
  on public.account_shares for delete
  using (auth.uid() = owner_id);

-- RLS Policies for share_permissions
-- View permissions if you're the owner or the shared user
create policy "Users can view relevant permissions"
  on public.share_permissions for select
  using (
    share_id in (
      select id from public.account_shares 
      where owner_id = auth.uid() or shared_with_id = auth.uid()
    )
  );

-- Only owners can manage permissions
create policy "Owners can insert permissions"
  on public.share_permissions for insert
  with check (
    share_id in (select id from public.account_shares where owner_id = auth.uid())
  );

create policy "Owners can update permissions"
  on public.share_permissions for update
  using (
    share_id in (select id from public.account_shares where owner_id = auth.uid())
  );

create policy "Owners can delete permissions"
  on public.share_permissions for delete
  using (
    share_id in (select id from public.account_shares where owner_id = auth.uid())
  );

-- RLS Policies for share_invitations
-- Owners can view their invitations
create policy "Owners can view their invitations"
  on public.share_invitations for select
  using (auth.uid() = owner_id);

-- Invited users can view invitations sent to them
create policy "Invited users can view their invitations"
  on public.share_invitations for select
  using (
    invited_email = (select email from auth.users where id = auth.uid())
  );

-- Only owners can create invitations
create policy "Owners can create invitations"
  on public.share_invitations for insert
  with check (auth.uid() = owner_id);

-- Only owners can update their invitations
create policy "Owners can update their invitations"
  on public.share_invitations for update
  using (auth.uid() = owner_id);

-- Invited users can update invitation status (accept/reject)
create policy "Invited users can update invitation status"
  on public.share_invitations for update
  using (
    invited_email = (select email from auth.users where id = auth.uid())
  );

-- Only owners can delete invitations
create policy "Owners can delete invitations"
  on public.share_invitations for delete
  using (auth.uid() = owner_id);

-- Update existing RLS policies to include shared access
-- Drop existing policies
drop policy if exists "Users can view own accounts" on public.accounts;
drop policy if exists "Users can insert own accounts" on public.accounts;
drop policy if exists "Users can update own accounts" on public.accounts;
drop policy if exists "Users can delete own accounts" on public.accounts;

drop policy if exists "Users can view own transactions" on public.transactions;
drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Users can update own transactions" on public.transactions;
drop policy if exists "Users can delete own transactions" on public.transactions;

drop policy if exists "Users can view own credits" on public.credits;
drop policy if exists "Users can insert own credits" on public.credits;
drop policy if exists "Users can update own credits" on public.credits;
drop policy if exists "Users can delete own credits" on public.credits;

drop policy if exists "Users can view own recurring services" on public.recurring_services;
drop policy if exists "Users can insert own recurring services" on public.recurring_services;
drop policy if exists "Users can update own recurring services" on public.recurring_services;
drop policy if exists "Users can delete own recurring services" on public.recurring_services;

drop policy if exists "Users can view own categories" on public.categories;
drop policy if exists "Users can insert own categories" on public.categories;
drop policy if exists "Users can update own categories" on public.categories;
drop policy if exists "Users can delete own categories" on public.categories;

-- Create helper function to check permissions
create or replace function public.has_share_permission(
  target_user_id uuid,
  resource text,
  permission_type text
)
returns boolean
language plpgsql
security definer
as $$
declare
  has_permission boolean;
begin
  -- Check if current user has the requested permission for the target user's data
  select exists(
    select 1
    from public.account_shares s
    join public.share_permissions p on p.share_id = s.id
    where s.owner_id = target_user_id
      and s.shared_with_id = auth.uid()
      and s.is_active = true
      and p.resource_type = resource
      and (
        (permission_type = 'view' and p.can_view = true) or
        (permission_type = 'create' and p.can_create = true) or
        (permission_type = 'edit' and p.can_edit = true) or
        (permission_type = 'delete' and p.can_delete = true)
      )
  ) into has_permission;
  
  return has_permission;
end;
$$;

-- New RLS policies with shared access for ACCOUNTS
create policy "Users can view own or shared accounts"
  on public.accounts for select
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'accounts', 'view')
  );

create policy "Users can insert own accounts or with permission"
  on public.accounts for insert
  with check (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'accounts', 'create')
  );

create policy "Users can update own accounts or with permission"
  on public.accounts for update
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'accounts', 'edit')
  );

create policy "Users can delete own accounts or with permission"
  on public.accounts for delete
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'accounts', 'delete')
  );

-- New RLS policies with shared access for TRANSACTIONS
create policy "Users can view own or shared transactions"
  on public.transactions for select
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'transactions', 'view')
  );

create policy "Users can insert own transactions or with permission"
  on public.transactions for insert
  with check (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'transactions', 'create')
  );

create policy "Users can update own transactions or with permission"
  on public.transactions for update
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'transactions', 'edit')
  );

create policy "Users can delete own transactions or with permission"
  on public.transactions for delete
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'transactions', 'delete')
  );

-- New RLS policies with shared access for CREDITS
create policy "Users can view own or shared credits"
  on public.credits for select
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'credits', 'view')
  );

create policy "Users can insert own credits or with permission"
  on public.credits for insert
  with check (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'credits', 'create')
  );

create policy "Users can update own credits or with permission"
  on public.credits for update
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'credits', 'edit')
  );

create policy "Users can delete own credits or with permission"
  on public.credits for delete
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'credits', 'delete')
  );

-- New RLS policies with shared access for RECURRING SERVICES
create policy "Users can view own or shared services"
  on public.recurring_services for select
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'services', 'view')
  );

create policy "Users can insert own services or with permission"
  on public.recurring_services for insert
  with check (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'services', 'create')
  );

create policy "Users can update own services or with permission"
  on public.recurring_services for update
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'services', 'edit')
  );

create policy "Users can delete own services or with permission"
  on public.recurring_services for delete
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'services', 'delete')
  );

-- New RLS policies with shared access for CATEGORIES
create policy "Users can view own or shared categories"
  on public.categories for select
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'categories', 'view')
  );

create policy "Users can insert own categories or with permission"
  on public.categories for insert
  with check (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'categories', 'create')
  );

create policy "Users can update own categories or with permission"
  on public.categories for update
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'categories', 'edit')
  );

create policy "Users can delete own categories or with permission"
  on public.categories for delete
  using (
    auth.uid() = user_id or 
    public.has_share_permission(user_id, 'categories', 'delete')
  );

-- Create indexes for better performance
create index if not exists account_shares_owner_id_idx on public.account_shares(owner_id);
create index if not exists account_shares_shared_with_id_idx on public.account_shares(shared_with_id);
create index if not exists share_permissions_share_id_idx on public.share_permissions(share_id);
create index if not exists share_invitations_owner_id_idx on public.share_invitations(owner_id);
create index if not exists share_invitations_invited_email_idx on public.share_invitations(invited_email);
create index if not exists share_invitations_token_idx on public.share_invitations(invitation_token);
