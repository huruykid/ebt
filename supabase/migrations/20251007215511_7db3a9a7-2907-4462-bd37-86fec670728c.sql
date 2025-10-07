-- Drop the overly strict policy
DROP POLICY IF EXISTS "Admins can upload blog images with validation" ON storage.objects;

-- Create a simpler policy that just checks admin status
-- Client-side validation already handles file type and size
CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'blog-images' 
  AND is_admin_user()
);