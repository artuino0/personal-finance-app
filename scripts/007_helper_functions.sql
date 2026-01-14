-- Create function to get user ID by email
create or replace function public.get_user_id_by_email(user_email text)
returns uuid
language plpgsql
security definer
as $$
declare
  user_uuid uuid;
begin
  select id into user_uuid
  from auth.users
  where email = user_email
  limit 1;
  
  return user_uuid;
end;
$$;

-- Grant execute permission
grant execute on function public.get_user_id_by_email(text) to authenticated;
