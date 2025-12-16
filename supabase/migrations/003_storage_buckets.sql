-- Migration: 003_storage_buckets.sql
-- Description: Configure Supabase Storage buckets for pet photos

-- Note: This SQL is for documentation purposes.
-- Storage buckets should be created via Supabase Dashboard or Supabase CLI.
-- The following describes the bucket configuration:

/*
BUCKET: pet-photos
- Public: Yes (public read access)
- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
- Max file size: 5MB

POLICIES:
1. Anyone can view pet photos (public bucket)
2. Authenticated users can upload photos
3. Users can only delete their own uploaded photos
*/

-- If you're running this via Supabase Management API or have storage schema access:

-- Create the storage bucket (uncomment if needed)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--     'pet-photos',
--     'pet-photos',
--     true,
--     5242880, -- 5MB in bytes
--     ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
-- );

-- Storage policies (these need to be created via Supabase Dashboard or API)
-- The following are the policy definitions:

-- Policy: Public read access
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'pet-photos');

-- Policy: Authenticated users can upload
-- CREATE POLICY "Authenticated users can upload pet photos"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--     bucket_id = 'pet-photos'
--     AND auth.role() = 'authenticated'
-- );

-- Policy: Users can update their own uploads
-- CREATE POLICY "Users can update own uploads"
-- ON storage.objects FOR UPDATE
-- USING (
--     bucket_id = 'pet-photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
-- )
-- WITH CHECK (
--     bucket_id = 'pet-photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can delete their own uploads
-- CREATE POLICY "Users can delete own uploads"
-- ON storage.objects FOR DELETE
-- USING (
--     bucket_id = 'pet-photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- ===========================================
-- MANUAL SETUP INSTRUCTIONS
-- ===========================================
-- 
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a new bucket named "pet-photos"
-- 3. Enable "Public bucket" option
-- 4. Set max file size to 5MB
-- 5. Add allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- 6. Configure the following policies:
--
--    FOR SELECT (Public read):
--    - Policy name: "Public Access"
--    - Allowed operation: SELECT
--    - Target roles: Leave empty (all roles)
--    - USING expression: true
--
--    FOR INSERT (Authenticated upload):
--    - Policy name: "Authenticated users can upload"
--    - Allowed operation: INSERT
--    - Target roles: authenticated
--    - WITH CHECK expression: true
--
--    FOR DELETE (Owner only):
--    - Policy name: "Users can delete own uploads"
--    - Allowed operation: DELETE
--    - Target roles: authenticated
--    - USING expression: auth.uid()::text = (storage.foldername(name))[1]
