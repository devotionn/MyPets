-- Migration: 007_debug_and_fix.sql
-- Description: Diagnostic script to check why users are not syncing.

-- 1. Check counts (This will appear in the "Results" tab of SQL Editor)
SELECT 'auth.users count' as table_name, count(*) as count FROM auth.users
UNION ALL
SELECT 'public.users count' as table_name, count(*) as count FROM public.users;

-- 2. Verify Trigger Exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- 3. Force Manual Sync (Again, with explicit commit/raise notice)
DO $$
DECLARE
    r RECORD;
    inserted_count INT := 0;
BEGIN
    FOR r IN SELECT * FROM auth.users LOOP
        BEGIN
            INSERT INTO public.users (id, display_name, role, username, email, created_at, updated_at)
            VALUES (
                r.id, 
                r.raw_user_meta_data->>'display_name', 
                'user',
                COALESCE(r.raw_user_meta_data->>'username', split_part(r.email, '@', 1)), -- Fallback to email prefix if no username
                r.email,
                r.created_at,
                r.created_at
            )
            ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email;
            
            inserted_count := inserted_count + 1;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error syncing user %: %', r.id, SQLERRM;
        END;
    END LOOP;
    RAISE NOTICE 'Manual sync attempt finished. Processed rows: %', inserted_count;
END $$;

-- 4. Check counts again
SELECT 'auth.users count' as table_name, count(*) as count FROM auth.users
UNION ALL
SELECT 'public.users count' as table_name, count(*) as count FROM public.users;
