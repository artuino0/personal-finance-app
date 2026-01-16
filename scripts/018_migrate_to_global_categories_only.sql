-- Migrate to global_categories only, deprecate user-specific categories table

-- Step 1: Drop the foreign key constraint from transactions.category_id
alter table public.transactions
  drop constraint if exists transactions_category_id_fkey;

-- Step 2: Add new column for global category reference
alter table public.transactions
  add column if not exists global_category_id uuid references public.global_categories(id) on delete set null;

-- Step 3: Migrate existing transactions to use global_categories
-- Match by category name and type
update public.transactions t
set global_category_id = (
  select gc.id
  from public.global_categories gc
  inner join public.categories c on c.id = t.category_id
  where lower(gc.name) = lower(c.name)
    and gc.type = c.type
  limit 1
)
where t.category_id is not null
  and t.global_category_id is null;

-- Step 4: Set any remaining transactions to a default category by type
update public.transactions t
set global_category_id = (
  select gc.id
  from public.global_categories gc
  inner join public.categories c on c.id = t.category_id
  where gc.type = c.type
  limit 1
)
where t.category_id is not null
  and t.global_category_id is null;

-- Step 5: Drop the old category_id column
alter table public.transactions
  drop column if exists category_id;

-- Step 6: Rename global_category_id to category_id for consistency
alter table public.transactions
  rename column global_category_id to category_id;

-- Step 7: Drop RLS policies for old categories table
drop policy if exists "Users can view own categories" on public.categories;
drop policy if exists "Users can insert own categories" on public.categories;
drop policy if exists "Users can update own categories" on public.categories;
drop policy if exists "Users can delete own categories" on public.categories;

-- Step 8: Disable RLS on deprecated categories table
alter table public.categories disable row level security;

-- Step 9: Add comment to mark table as deprecated
comment on table public.categories is 'DEPRECATED: Use global_categories instead. This table is kept for historical reference only.';

-- Step 10: Update the sharing permissions to remove 'categories' resource
-- Users no longer need permission to view categories as they are global
update public.share_permissions
set resource_type = 'deprecated'
where resource_type = 'categories';

-- Step 11: Create index on transactions.category_id for better performance
create index if not exists transactions_category_id_idx on public.transactions(category_id);

-- Step 12: Update the trigger to no longer create user categories
-- (This will be handled in the trigger script update)

comment on column public.transactions.category_id is 'References global_categories.id';
