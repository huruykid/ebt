-- Add unique constraint for google_places_cache table
ALTER TABLE google_places_cache 
ADD CONSTRAINT google_places_cache_unique_query 
UNIQUE (search_query, params_hash, fields_hash);