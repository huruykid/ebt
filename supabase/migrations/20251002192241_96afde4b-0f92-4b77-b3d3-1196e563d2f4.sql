-- Secure google_places_public view access
-- Currently allows anonymous access, enabling potential data scraping

-- Revoke anonymous access to prevent unlimited scraping
REVOKE SELECT ON public.google_places_public FROM anon;

-- Ensure only authenticated users can access cached Google Places data
-- This prevents competitors from scraping without any authentication barrier
GRANT SELECT ON public.google_places_public TO authenticated;

-- Add the same restriction to the underlying cache table for consistency
ALTER TABLE public.google_places_cache ENABLE ROW LEVEL SECURITY;

-- Update existing policy to be more explicit
DROP POLICY IF EXISTS "Authenticated users can view cached places data" ON public.google_places_cache;

CREATE POLICY "Authenticated users can view cached places data"
  ON public.google_places_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role policy remains for backend operations
-- "Service role can manage cache data" policy already exists

-- Add documentation
COMMENT ON VIEW public.google_places_public IS 'Public view of Google Places cache data. Access restricted to authenticated users to prevent scraping. Phone numbers are redacted for privacy.';
COMMENT ON TABLE public.google_places_cache IS 'Cache of Google Places API responses. Access restricted to authenticated users and service role only.';