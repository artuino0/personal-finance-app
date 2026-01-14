-- Create global categories table for base catalog
create table if not exists public.global_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null,
  icon text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.global_categories enable row level security;

-- Everyone can read global categories
create policy "Global categories are readable by all authenticated users"
  on public.global_categories
  for select
  to authenticated
  using (true);

-- Only service role can manage global categories
create policy "Only service role can manage global categories"
  on public.global_categories
  for all
  to service_role
  using (true)
  with check (true);

-- Add is_custom column to categories table
alter table public.categories
  add column if not exists is_custom boolean default false,
  add column if not exists global_category_id uuid references public.global_categories(id);

-- Insert base global categories
insert into public.global_categories (name, type, color, icon) values
  -- Expense categories
  ('Alimentación', 'expense', '#ef4444', 'utensils'),
  ('Transporte', 'expense', '#f59e0b', 'car'),
  ('Vivienda', 'expense', '#8b5cf6', 'home'),
  ('Entretenimiento', 'expense', '#ec4899', 'film'),
  ('Salud', 'expense', '#10b981', 'heart-pulse'),
  ('Educación', 'expense', '#3b82f6', 'graduation-cap'),
  ('Compras', 'expense', '#06b6d4', 'shopping-bag'),
  ('Servicios', 'expense', '#6366f1', 'wrench'),
  ('Ropa', 'expense', '#f97316', 'shirt'),
  ('Mascotas', 'expense', '#ec4899', 'dog'),
  ('Regalos', 'expense', '#a855f7', 'gift'),
  ('Impuestos', 'expense', '#64748b', 'file-text'),
  -- Income categories
  ('Salario', 'income', '#22c55e', 'briefcase'),
  ('Freelance', 'income', '#14b8a6', 'laptop'),
  ('Inversiones', 'income', '#a855f7', 'trending-up'),
  ('Bonos', 'income', '#84cc16', 'award'),
  ('Ventas', 'income', '#06b6d4', 'shopping-cart'),
  ('Otros ingresos', 'income', '#10b981', 'coins')
on conflict do nothing;

-- Update function to link to global categories
create or replace function public.create_default_categories(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Link user to all active global categories
  insert into public.categories (user_id, name, type, color, icon, is_custom, global_category_id)
  select 
    user_id,
    gc.name,
    gc.type,
    gc.color,
    gc.icon,
    false,
    gc.id
  from public.global_categories gc
  where gc.is_active = true;
end;
$$;

-- Function to add new global category to all existing users
create or replace function public.propagate_global_category(category_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.categories (user_id, name, type, color, icon, is_custom, global_category_id)
  select 
    p.id,
    gc.name,
    gc.type,
    gc.color,
    gc.icon,
    false,
    gc.id
  from public.global_categories gc
  cross join public.profiles p
  where gc.id = category_id
  on conflict do nothing;
end;
$$;
