-- Fix blog-images upload policy - remove folder requirement
-- The previous policy required files to be in user-specific folders,
-- but the upload code places files in the root of the bucket

DROP POLICY IF EXISTS "Admins can upload blog images with validation" ON storage.objects;

CREATE POLICY "Admins can upload blog images with validation"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND public.is_admin_user()
  -- Enforce MIME type validation
  AND (
    lower((metadata->>'mimetype')::text) = 'image/jpeg'
    OR lower((metadata->>'mimetype')::text) = 'image/png'
    OR lower((metadata->>'mimetype')::text) = 'image/webp'
    OR lower((metadata->>'mimetype')::text) = 'image/gif'
  )
  -- Enforce 5MB file size limit (5 * 1024 * 1024 bytes)
  AND COALESCE((metadata->>'size')::int, 0) <= 5242880
);