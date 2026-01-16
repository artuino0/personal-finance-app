-- Fix trigger to use global_categories instead of hardcoded values
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_full_name text;
begin
  -- Extract full name from multiple sources
  user_full_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'user_name',
    split_part(new.email, '@', 1)
  );

  -- Create profile
  insert into public.profiles (id, full_name)
  values (new.id, user_full_name)
  on conflict (id) do nothing;

  -- Create categories from global_categories instead of hardcoded
  insert into public.categories (user_id, name, type, color, icon, is_custom, global_category_id)
  select 
    new.id,
    gc.name,
    gc.type,
    gc.color,
    gc.icon,
    false,
    gc.id
  from public.global_categories gc
  where gc.is_active = true;

  return new;
end;
$$;

-- Function to fix existing users without categories
create or replace function public.fix_users_without_categories()
returns void
language plpgsql
security definer
as $$
begin
  -- Find users who don't have categories and add them
  insert into public.categories (user_id, name, type, color, icon, is_custom, global_category_id)
  select 
    p.id,
    gc.name,
    gc.type,
    gc.color,
    gc.icon,
    false,
    gc.id
  from public.profiles p
  cross join public.global_categories gc
  where gc.is_active = true
    and not exists (
      select 1 from public.categories c 
      where c.user_id = p.id 
      and c.global_category_id = gc.id
    );
end;
$$;

-- Execute the fix for existing users
select public.fix_users_without_categories();
