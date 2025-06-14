
-- Enable the pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.smart_store_search(TEXT, TEXT, TEXT, REAL, INTEGER);

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
    s."Store_Name" as store_name,
    s."Store_Street_Address" as store_street_address,
    s."City" as city,
    s."State" as state,
    s."Zip_Code" as zip_code,
    s."Store_Type" as store_type,
    s."Latitude" as latitude,
    s."Longitude" as longitude,
    GREATEST(
      COALESCE(similarity(s."Store_Name", search_text), 0),
      COALESCE(similarity(s."Store_Type", search_text), 0)
    ) as similarity_score
  FROM snap_stores s
  WHERE 
    -- Text search with fuzzy matching
    (
      search_text = '' OR
      similarity(s."Store_Name", search_text) > similarity_threshold OR
      similarity(s."Store_Type", search_text) > similarity_threshold OR
      s."Store_Name" ILIKE '%' || search_text || '%' OR
      s."Store_Type" ILIKE '%' || search_text || '%'
    )
    AND
    -- City filter (optional)
    (
      search_city = '' OR
      similarity(s."City", search_city) > 0.4 OR
      s."City" ILIKE '%' || search_city || '%'
    )
    AND
    -- Zip code filter (optional)
    (
      search_zip = '' OR
      s."Zip_Code" LIKE search_zip || '%' OR
      s."Zip_Code" = search_zip
    )
    AND
    -- Ensure we have valid coordinates
    s."Latitude" IS NOT NULL 
    AND s."Longitude" IS NOT NULL
  ORDER BY 
    similarity_score DESC,
    s."Store_Name" ASC
  LIMIT result_limit;
END;
$$;
