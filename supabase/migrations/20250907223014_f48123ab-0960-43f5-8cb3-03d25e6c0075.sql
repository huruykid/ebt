-- Fix google_places_cache unique constraints for proper caching
-- Add unique constraint for search queries with parameters
CREATE UNIQUE INDEX IF NOT EXISTS idx_google_places_cache_search_unique 
ON public.google_places_cache (search_query, params_hash, fields_hash)
WHERE place_id IS NULL;

-- Add unique constraint for place details
CREATE UNIQUE INDEX IF NOT EXISTS idx_google_places_cache_place_unique 
ON public.google_places_cache (place_id, fields_hash)
WHERE place_id IS NOT NULL;