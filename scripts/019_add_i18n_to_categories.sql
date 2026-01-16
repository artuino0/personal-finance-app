-- Add multilingual support to global_categories
alter table public.global_categories
  add column if not exists name_en text,
  add column if not exists name_es text;

-- Migrate existing name to name_es (current names are in Spanish)
update public.global_categories
set name_es = name
where name_es is null;

-- Add English translations
update public.global_categories
set name_en = case name_es
  -- Expense categories
  when 'Alimentación' then 'Food'
  when 'Transporte' then 'Transportation'
  when 'Vivienda' then 'Housing'
  when 'Entretenimiento' then 'Entertainment'
  when 'Salud' then 'Health'
  when 'Educación' then 'Education'
  when 'Compras' then 'Shopping'
  when 'Servicios' then 'Services'
  when 'Ropa' then 'Clothing'
  when 'Mascotas' then 'Pets'
  when 'Regalos' then 'Gifts'
  when 'Impuestos' then 'Taxes'
  -- Income categories
  when 'Salario' then 'Salary'
  when 'Freelance' then 'Freelance'
  when 'Inversiones' then 'Investments'
  when 'Bonos' then 'Bonuses'
  when 'Ventas' then 'Sales'
  when 'Otros ingresos' then 'Other Income'
  else name_es
end
where name_en is null;

-- Make both columns required
alter table public.global_categories
  alter column name_en set not null,
  alter column name_es set not null;

-- Drop the old name column (keep for backward compatibility during migration)
-- We'll keep it for now to avoid breaking existing queries
-- alter table public.global_categories drop column name;

-- Create a view that selects the correct language based on locale
-- This will be used by the application
create or replace function public.get_localized_categories(user_locale text default 'es')
returns table (
  id uuid,
  name text,
  type text,
  color text,
  icon text,
  is_active boolean,
  created_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    gc.id,
    case 
      when user_locale = 'en' then gc.name_en
      else gc.name_es
    end as name,
    gc.type,
    gc.color,
    gc.icon,
    gc.is_active,
    gc.created_at
  from public.global_categories gc
  where gc.is_active = true
  order by 
    case 
      when user_locale = 'en' then gc.name_en
      else gc.name_es
    end;
end;
$$;

COMMIT;
