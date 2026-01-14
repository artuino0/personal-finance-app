-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;

  -- Create default categories automatically
  insert into public.categories (user_id, name, type, color, icon) values
    (new.id, 'Alimentación', 'expense', '#ef4444', 'utensils'),
    (new.id, 'Transporte', 'expense', '#f59e0b', 'car'),
    (new.id, 'Vivienda', 'expense', '#8b5cf6', 'home'),
    (new.id, 'Entretenimiento', 'expense', '#ec4899', 'film'),
    (new.id, 'Salud', 'expense', '#10b981', 'heart-pulse'),
    (new.id, 'Educación', 'expense', '#3b82f6', 'graduation-cap'),
    (new.id, 'Compras', 'expense', '#06b6d4', 'shopping-bag'),
    (new.id, 'Servicios', 'expense', '#6366f1', 'wrench'),
    (new.id, 'Salario', 'income', '#22c55e', 'briefcase'),
    (new.id, 'Freelance', 'income', '#14b8a6', 'laptop'),
    (new.id, 'Inversiones', 'income', '#a855f7', 'trending-up'),
    (new.id, 'Otros ingresos', 'income', '#84cc16', 'coins');

  return new;
end;
$$;

-- Trigger to call the function when a new user is created
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
