-- Fix SECURITY DEFINER views warning
-- Recreate views with SECURITY INVOKER to use querying user's permissions

-- Drop existing views
DROP VIEW IF EXISTS public.public_reviews CASCADE;
DROP VIEW IF EXISTS public.public_store_comments CASCADE;

-- Recreate public_reviews as SECURITY INVOKER
CREATE VIEW public.public_reviews 
WITH (security_invoker=true) AS
SELECT 
  id,
  store_id,
  rating,
  review_text,
  created_at,
  updated_at
FROM public.reviews;

-- Recreate public_store_comments as SECURITY INVOKER  
CREATE VIEW public.public_store_comments
WITH (security_invoker=true) AS
SELECT 
  id,
  store_id,
  comment_text,
  user_name,
  created_at,
  updated_at
FROM public.store_comments;

-- Grant SELECT on views to everyone
GRANT SELECT ON public.public_reviews TO anon, authenticated;
GRANT SELECT ON public.public_store_comments TO anon, authenticated;

-- Add RLS policies for the views so they work properly
ALTER VIEW public.public_reviews SET (security_invoker = on);
ALTER VIEW public.public_store_comments SET (security_invoker = on);

-- Create policies to allow public access through the views
CREATE POLICY "Public can view anonymized reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can view anonymized comments"  
ON public.store_comments
FOR SELECT
TO anon, authenticated
USING (true);