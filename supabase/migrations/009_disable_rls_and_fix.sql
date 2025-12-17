-- Migration: 009_disable_rls_and_fix.sql
-- Description: 暂时关闭 RLS 以排除权限问题，并强制同步数据

-- 1. 暂时禁用 users 表的 RLS (Row Level Security)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. 再次执行强制同步 (Backfill)
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

-- 3. 检查结果
SELECT 'Sync Finished. Public Users Count: ' || count(*) as result FROM public.users;

-- 4. 如果你想重新开启 RLS，请在确认数据存在后运行:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
