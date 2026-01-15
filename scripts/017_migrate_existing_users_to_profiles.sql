-- Script to migrate existing users without profiles
-- This creates profile records for all auth.users that don't have a corresponding profile

-- Insert profiles for users that don't have one yet
INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'display_name',
    split_part(u.email, '@', 1)
  ) as full_name,
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  ) as avatar_url,
  timezone('utc'::text, now()) as created_at,
  timezone('utc'::text, now()) as updated_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE
SET 
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
  updated_at = timezone('utc'::text, now());

-- Show results
SELECT 
  id,
  full_name,
  avatar_url,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
