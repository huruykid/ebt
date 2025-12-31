-- Improve smart_store_search to handle special characters like apostrophes
-- This normalizes both the search text and store names for better matching
CREATE OR REPLACE FUNCTION public.smart_store_search(
  search_text text DEFAULT ''::text, 
  search_city text DEFAULT ''::text, 
  search_state text DEFAULT ''::text, 
  search_zip text DEFAULT ''::text, 
  similarity_threshold real DEFAULT 0.3, 
  result_limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid, 
  store_name text, 
  store_street_address text, 
  city text, 
  state text, 
  zip_code text, 
  store_type text, 
  latitude double precision, 
  longitude double precision, 
  similarity_score real
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  -- Normalize search text: remove apostrophes and special characters for matching
  normalized_search text := regexp_replace(lower(search_text), '[^a-z0-9\s]', '', 'g');
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
    -- Calculate similarity score using pattern matching
    GREATEST(
      -- Exact match on normalized names (removes apostrophes, etc)
      CASE WHEN regexp_replace(lower(s."Store_Name"), '[^a-z0-9\s]', '', 'g') ILIKE '%' || normalized_search || '%' THEN 0.9::REAL ELSE 0::REAL END,
      CASE WHEN regexp_replace(lower(s."Store_Type"), '[^a-z0-9\s]', '', 'g') ILIKE '%' || normalized_search || '%' THEN 0.8::REAL ELSE 0::REAL END,
      -- Original ILIKE search (for backward compatibility)
      CASE WHEN s."Store_Name" ILIKE '%' || search_text || '%' THEN 0.9::REAL ELSE 0::REAL END,
      CASE WHEN s."Store_Type" ILIKE '%' || search_text || '%' THEN 0.8::REAL ELSE 0::REAL END,
      -- Word boundary matches
      CASE WHEN s."Store_Name" ILIKE search_text || '%' THEN 0.7::REAL ELSE 0::REAL END,
      CASE WHEN s."Store_Type" ILIKE search_text || '%' THEN 0.6::REAL ELSE 0::REAL END,
      -- Partial word matches (first word of search)
      CASE WHEN regexp_replace(lower(s."Store_Name"), '[^a-z0-9\s]', '', 'g') ILIKE '%' || split_part(normalized_search, ' ', 1) || '%' THEN 0.5::REAL ELSE 0::REAL END,
      -- Incentive program bonus
      CASE WHEN s."Incentive_Program" IS NOT NULL THEN 0.1::REAL ELSE 0::REAL END
    ) as similarity_score
  FROM snap_stores s
  WHERE 
    s."Latitude" IS NOT NULL 
    AND s."Longitude" IS NOT NULL
    AND s."Store_Name" IS NOT NULL
    AND s."Store_Name" != ''
    AND (
      search_zip = '' OR
      s."Zip_Code" = search_zip OR
      s."Zip_Code" LIKE search_zip || '%'
    )
    AND (
      search_city = '' OR
      s."City" ILIKE search_city OR
      s."City" ILIKE '%' || search_city || '%'
    )
    AND (
      search_state = '' OR
      s."State" ILIKE search_state OR
      s."State" ILIKE '%' || search_state || '%'
    )
    AND (
      search_text = '' OR
      -- Match on original text
      s."Store_Name" ILIKE '%' || search_text || '%' OR
      s."Store_Type" ILIKE '%' || search_text || '%' OR
      -- Match on normalized text (handles apostrophes, hyphens, etc)
      regexp_replace(lower(s."Store_Name"), '[^a-z0-9\s]', '', 'g') ILIKE '%' || normalized_search || '%' OR
      regexp_replace(lower(s."Store_Type"), '[^a-z0-9\s]', '', 'g') ILIKE '%' || normalized_search || '%'
    )
  ORDER BY 
    similarity_score DESC,
    CASE WHEN s."Incentive_Program" IS NOT NULL THEN 0 ELSE 1 END,
    s."Store_Name" ASC
  LIMIT result_limit;
END;
$function$;