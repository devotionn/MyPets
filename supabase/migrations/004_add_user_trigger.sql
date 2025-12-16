-- Migration: 004_add_user_trigger.sql
-- Description: Automatically create public user profile when a new auth user is created.
--              Also fixes missing data for existing users.

-- 1. Create the function that handles the new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url, role, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user', -- default role
    NEW.raw_user_meta_data->>'username' -- Mapping username from metadata
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill script: Fix existing users who are in auth.users but not in public.users
INSERT INTO public.users (id, display_name, role, username, created_at, updated_at)
SELECT 
    id, 
    raw_user_meta_data->>'display_name', 
    'user',
    raw_user_meta_data->>'username',
    created_at,
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
