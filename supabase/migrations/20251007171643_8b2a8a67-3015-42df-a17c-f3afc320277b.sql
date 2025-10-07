-- Phase 1: Critical Security Fixes

-- 1. Secure Newsletter Subscribers - Restrict email viewing to admins only
CREATE POLICY "Only admins can view subscriber emails"
ON public.newsletter_subscribers
FOR SELECT
USING (public.is_admin_user());

-- 2. Add Server-Side File Upload Protection for blog-images bucket
-- Drop existing upload policy and recreate with enhanced validation
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;

CREATE POLICY "Admins can upload blog images with validation"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND public.is_admin_user()
  AND (storage.foldername(name))[1] = auth.uid()::text
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

-- 3. Fix user_stats and store_review_stats_secure views
-- Set security_invoker so views run with the privileges of the caller,
-- allowing RLS policies on underlying tables to apply properly
ALTER VIEW public.user_stats SET (security_invoker = on);
ALTER VIEW public.store_review_stats_secure SET (security_invoker = on);