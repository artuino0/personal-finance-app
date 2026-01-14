-- Improved trigger function to extract user name from multiple sources
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name text;
BEGIN
  -- Try to extract name from multiple sources
  user_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    new.raw_app_meta_data->>'full_name',
    -- Extract name from email (before @)
    SPLIT_PART(new.email, '@', 1)
  );

  -- Create profile with extracted name
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, user_name)
  ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);

  -- Create default categories automatically
  INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
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
    (new.id, 'Otros ingresos', 'income', '#84cc16', 'coins')
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$;

-- Function to sync existing users who don't have profiles or names
CREATE OR REPLACE FUNCTION sync_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  user_name text;
BEGIN
  -- Loop through all auth users
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data, raw_app_meta_data
    FROM auth.users
  LOOP
    -- Extract name from multiple sources
    user_name := COALESCE(
      user_record.raw_user_meta_data->>'full_name',
      user_record.raw_user_meta_data->>'name',
      user_record.raw_user_meta_data->>'display_name',
      user_record.raw_app_meta_data->>'full_name',
      SPLIT_PART(user_record.email, '@', 1)
    );

    -- Insert or update profile
    INSERT INTO public.profiles (id, full_name)
    VALUES (user_record.id, user_name)
    ON CONFLICT (id) DO UPDATE
    SET full_name = CASE 
      WHEN profiles.full_name IS NULL OR profiles.full_name = '' 
      THEN EXCLUDED.full_name 
      ELSE profiles.full_name 
    END;
  END LOOP;
END;
$$;

-- Execute the sync function to fix existing users
SELECT sync_missing_profiles();
