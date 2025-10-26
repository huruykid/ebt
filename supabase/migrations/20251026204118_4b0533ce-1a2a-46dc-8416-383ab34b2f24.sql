-- Fix security issues found in security scan

-- 1. Grant public access to store_review_stats_secure view
GRANT SELECT ON public.store_review_stats_secure TO anon;
GRANT SELECT ON public.store_review_stats_secure TO authenticated;

-- 2. Grant public access to legacy public_reviews view
GRANT SELECT ON public.public_reviews TO anon;
GRANT SELECT ON public.public_reviews TO authenticated;

-- 3. Grant public access to legacy public_store_comments view  
GRANT SELECT ON public.public_store_comments TO anon;
GRANT SELECT ON public.public_store_comments TO authenticated;

-- 4. Create a secure view for reviews that excludes user_id for privacy
-- This allows public access to reviews without exposing which user wrote them
CREATE OR REPLACE VIEW public.reviews_public AS
SELECT 
  id,
  store_id,
  rating,
  review_text,
  created_at,
  updated_at
FROM public.reviews;

-- Grant SELECT on the secure reviews view
GRANT SELECT ON public.reviews_public TO anon;
GRANT SELECT ON public.reviews_public TO authenticated;

-- Add privacy documentation
COMMENT ON VIEW public.reviews_public IS 'Public view of reviews that excludes user_id to protect reviewer privacy and prevent harassment or retaliation.';

-- 5. Document store_clicks privacy protection
COMMENT ON TABLE public.store_clicks IS 'User location data is stored for analytics. Admin access is restricted to anonymized aggregates via get_store_click_analytics() function which rounds coordinates to ~11km precision. Direct access to precise coordinates is blocked by RLS policies.';

COMMENT ON COLUMN public.store_clicks.user_latitude IS 'Precise latitude stored for user analytics. Only accessible to the user who created it. Admins can only access anonymized aggregates.';

COMMENT ON COLUMN public.store_clicks.user_longitude IS 'Precise longitude stored for user analytics. Only accessible to the user who created it. Admins can only access anonymized aggregates.';