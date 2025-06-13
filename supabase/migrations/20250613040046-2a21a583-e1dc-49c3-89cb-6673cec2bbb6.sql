
-- Enable the pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a function for smart store search with fuzzy matching
CREATE OR REPLACE FUNCTION public.smart_store_search(
  search_text TEXT DEFAULT '',
  search_city TEXT DEFAULT '',
  search_zip TEXT DEFAULT '',
  similarity_threshold REAL DEFAULT 0.3,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  store_name TEXT,
  store_street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  store_type TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  similarity_score REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.store_name,
    s.store_street_address,
    s.city,
    s.state,
    s.zip_code,
    s.store_type,
    s.latitude,
    s.longitude,
    GREATEST(
      COALESCE(similarity(s.store_name, search_text), 0),
      COALESCE(similarity(s.store_type, search_text), 0)
    ) as similarity_score
  FROM snap_stores s
  WHERE 
    -- Text search with fuzzy matching
    (
      search_text = '' OR
      similarity(s.store_name, search_text) > similarity_threshold OR
      similarity(s.store_type, search_text) > similarity_threshold OR
      s.store_name ILIKE '%' || search_text || '%' OR
      s.store_type ILIKE '%' || search_text || '%'
    )
    AND
    -- City filter (optional)
    (
      search_city = '' OR
      similarity(s.city, search_city) > 0.4 OR
      s.city ILIKE '%' || search_city || '%'
    )
    AND
    -- Zip code filter (optional)
    (
      search_zip = '' OR
      s.zip_code LIKE search_zip || '%' OR
      s.zip_code = search_zip
    )
  ORDER BY 
    similarity_score DESC,
    s.store_name ASC
  LIMIT result_limit;
END;
$$;
