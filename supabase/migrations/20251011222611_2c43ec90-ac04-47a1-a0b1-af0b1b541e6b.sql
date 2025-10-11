-- Fix: Unlimited File Uploads Enable DoS (store-photos bucket)
-- Add file size limit (10MB) and restrict to image MIME types
UPDATE storage.buckets
SET 
  file_size_limit = 10485760,  -- 10MB in bytes
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'store-photos';

-- Fix: Newsletter Table Lacks Explicit Access Denial
-- Add explicit DENY policy for defense-in-depth
CREATE POLICY "Deny non-admin direct access to newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
TO public, anon, authenticated
USING (false)
WITH CHECK (false);