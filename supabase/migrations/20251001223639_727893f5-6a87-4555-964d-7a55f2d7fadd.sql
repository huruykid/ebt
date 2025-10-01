-- =====================================================
-- Security Fix: Restrict public access to review data
-- =====================================================

-- 1. Add RLS policies to public_reviews view
-- Views inherit RLS from their source tables, but we'll add explicit policies
ALTER VIEW public.public_reviews SET (security_invoker = true);

-- Add RLS policy to require authentication for viewing reviews
CREATE POLICY "Authenticated users can view public reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- 2. Restrict public access to google_places_cache sensitive data
-- Remove the public access policy and add authenticated-only access
DROP POLICY IF EXISTS "Anyone can view cached places data" ON public.google_places_cache;

CREATE POLICY "Authenticated users can view cached places data"
ON public.google_places_cache
FOR SELECT
TO authenticated
USING (true);

-- Allow public to view only non-sensitive cached data (without phone numbers)
-- by creating a public view that excludes sensitive fields
CREATE OR REPLACE VIEW public.google_places_public AS
SELECT 
  id,
  search_query,
  place_id,
  fields_hash,
  params_hash,
  -- Exclude sensitive business_data fields by transforming the jsonb
  jsonb_set(
    business_data,
    '{formatted_phone_number}',
    'null'::jsonb
  ) - 'international_phone_number' as business_data,
  created_at,
  last_updated,
  cache_expires_at,
  fresh_until
FROM public.google_places_cache;

-- Make the public view accessible to everyone
GRANT SELECT ON public.google_places_public TO anon;
GRANT SELECT ON public.google_places_public TO authenticated;

COMMENT ON VIEW public.google_places_public IS 'Public view of Google Places cache with sensitive phone numbers removed for privacy protection';