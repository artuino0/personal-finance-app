-- Function to create default categories for new users
create or replace function public.create_default_categories(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Insert default expense categories
  insert into public.categories (user_id, name, type, color, icon) values
    (user_id, 'Alimentación', 'expense', '#ef4444', 'utensils'),
    (user_id, 'Transporte', 'expense', '#f59e0b', 'car'),
    (user_id, 'Vivienda', 'expense', '#8b5cf6', 'home'),
    (user_id, 'Entretenimiento', 'expense', '#ec4899', 'film'),
    (user_id, 'Salud', 'expense', '#10b981', 'heart-pulse'),
    (user_id, 'Educación', 'expense', '#3b82f6', 'graduation-cap'),
    (user_id, 'Compras', 'expense', '#06b6d4', 'shopping-bag'),
    (user_id, 'Servicios', 'expense', '#6366f1', 'wrench');

  -- Insert default income categories
  insert into public.categories (user_id, name, type, color, icon) values
    (user_id, 'Salario', 'income', '#22c55e', 'briefcase'),
    (user_id, 'Freelance', 'income', '#14b8a6', 'laptop'),
    (user_id, 'Inversiones', 'income', '#a855f7', 'trending-up'),
    (user_id, 'Otros ingresos', 'income', '#84cc16', 'coins');
end;
$$;
