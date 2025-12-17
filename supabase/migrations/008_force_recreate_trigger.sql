-- Migration: 008_force_recreate_trigger.sql
-- Description: 强制重建触发器和函数，并手动同步数据。解决 public.users 空数据问题。

-- 1. 彻底删除旧的 Trigger 和 Function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. 也是确保表结构没问题
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
-- 给 public.users 赋予应有的权限 (防止权限问题导致插入失败)
GRANT ALL ON TABLE public.users TO postgres;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;

-- 3. 创建最简单的同步函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    'user',
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    username = COALESCE(public.users.username, EXCLUDED.username);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 重新创建 Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ★重点★：立刻手动同步一次所有丢失的用户
INSERT INTO public.users (id, username, email, role, display_name, created_at, updated_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    email,
    'user',
    COALESCE(raw_user_meta_data->>'display_name', 'Restored User'),
    created_at,
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- 6. 验证结果
SELECT 'Sync Finished. Public Users Count: ' || count(*) FROM public.users;
