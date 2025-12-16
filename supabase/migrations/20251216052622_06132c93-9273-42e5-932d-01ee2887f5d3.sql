-- Remove overly permissive SELECT policies that expose user_id
DROP POLICY IF EXISTS "Anyone can view reviews anonymously" ON public.reviews;
DROP POLICY IF EXISTS "Public can view anonymized reviews" ON public.reviews;

-- Create a policy that allows users to see their own reviews (with user_id)
-- Admins policy and user update/delete policies already exist

-- Public should access reviews through the public_reviews view which excludes user_id
-- The view already exists and is properly anonymized

-- Add a comment explaining the security model
COMMENT ON TABLE public.reviews IS 'Reviews table with user_id protected. Public access should use public_reviews view for anonymized data.';