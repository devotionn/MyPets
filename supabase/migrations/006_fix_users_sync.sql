-- Migration: 006_fix_users_sync.sql
-- Description: 终极修复脚本 (Unified Fix)
-- 1. 确保 username 和 email 字段存在
-- 2. 重建同步 Trigger (包含 email/username)
-- 3. 强制把所有注册用户同步到 users 表

-- 1. 确保字段存在 (Safe to run multiple times)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- 确保 username 唯一索引 (如果不存在)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_username') THEN
        CREATE INDEX idx_users_username ON users(username);
    END IF;
END $$;

-- 2. 重建 Trigger 函数 (完全覆盖之前的逻辑)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url, role, username, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user', -- default role
    NEW.raw_user_meta_data->>'username',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    username = COALESCE(users.username, EXCLUDED.username),
    display_name = COALESCE(users.display_name, EXCLUDED.display_name);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 重新绑定 Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. 强制同步数据 (Backfill)
-- 将 auth.users 里存在但 public.users 里不存在的用户插入
INSERT INTO public.users (id, display_name, role, username, email, created_at, updated_at)
SELECT 
    id, 
    raw_user_meta_data->>'display_name', 
    'user',
    raw_user_meta_data->>'username',
    email,
    created_at,
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- 5. 修复已有数据 (如果 public.users 里有 id 但缺 email/username)
UPDATE public.users
SET 
  email = auth.users.email,
  username = COALESCE(public.users.username, auth.users.raw_user_meta_data->>'username')
FROM auth.users
WHERE public.users.id = auth.users.id
AND (public.users.email IS NULL OR public.users.username IS NULL);
