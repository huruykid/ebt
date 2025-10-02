-- Fix Security Definer View issue for google_places_public
-- Drop the existing view
DROP VIEW IF EXISTS public.google_places_public;

-- Recreate the view with security_invoker = true to use querying user's permissions
CREATE VIEW public.google_places_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  search_query,
  place_id,
  fields_hash,
  params_hash,
  jsonb_set(business_data, '{formatted_phone_number}'::text[], 'null'::jsonb) - 'international_phone_number'::text AS business_data,
  created_at,
  last_updated,
  cache_expires_at,
  fresh_until
FROM google_places_cache;

-- Grant SELECT permission to authenticated users
GRANT SELECT ON public.google_places_public TO authenticated;
GRANT SELECT ON public.google_places_public TO anon;