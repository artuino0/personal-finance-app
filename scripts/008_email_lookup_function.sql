-- Function to get user ID and name by email
create or replace function public.get_user_by_email(user_email text)
returns table (
  user_id uuid,
  full_name text,
  email text
) 
language plpgsql
security definer
as $$
begin
  return query
  select 
    au.id as user_id,
    p.full_name,
    au.email
  from auth.users au
  left join public.profiles p on p.id = au.id
  where au.email = user_email
  limit 1;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_user_by_email(text) to authenticated;
