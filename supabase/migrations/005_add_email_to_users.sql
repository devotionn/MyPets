-- Migration: 005_add_email_to_users.sql
-- Description: Add email column to public.users to support username login (resolving username -> email).
--              Updates trigger and backfills data.

-- 1. Add email column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update the sync function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url, role, username, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user', -- default role
    NEW.raw_user_meta_data->>'username', -- Mapping username from metadata
    NEW.email -- Sync email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill email for existing users
-- Run this in SQL Editor where you have admin privileges
UPDATE public.users
SET email = auth.users.email
FROM auth.users
WHERE public.users.id = auth.users.id
AND public.users.email IS NULL;
