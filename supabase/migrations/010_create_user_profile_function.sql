-- Migration: 010_create_user_profile_function.sql
-- Description: 创建一个带有 SECURITY DEFINER 权限的函数来插入用户资料
-- 这个函数可以绕过 RLS 和外键检查，因为它以 postgres 身份执行

CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    user_username TEXT,
    user_email TEXT,
    user_display_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    INSERT INTO public.users (id, username, email, display_name, role)
    VALUES (user_id, user_username, user_email, user_display_name, 'publisher')
    ON CONFLICT (id) DO UPDATE
    SET 
        username = COALESCE(users.username, EXCLUDED.username),
        email = COALESCE(users.email, EXCLUDED.email),
        display_name = COALESCE(users.display_name, EXCLUDED.display_name);
    
    result := jsonb_build_object('success', true);
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object('success', false, 'error', SQLERRM);
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon;
