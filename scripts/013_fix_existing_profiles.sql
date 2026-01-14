-- Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, full_name)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    au.email
  ) as full_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE
SET full_name = COALESCE(
  EXCLUDED.full_name,
  profiles.full_name,
  'Usuario'
);
