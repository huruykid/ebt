-- Create a fallback smart_store_search function that doesn't rely on pg_trgm
CREATE OR REPLACE FUNCTION public.smart_store_search(
  search_text TEXT DEFAULT '', 
  search_city TEXT DEFAULT '', 
  search_state TEXT DEFAULT '', 
  search_zip TEXT DEFAULT '', 
  similarity_threshold REAL DEFAULT 0.3, 
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
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
    -- Calculate similarity score using pattern matching (no pg_trgm needed)
    GREATEST(
      -- Exact match bonus (highest priority)
      CASE WHEN s."Store_Name" ILIKE '%' || search_text || '%' THEN 0.9 ELSE 0 END,
      CASE WHEN s."Store_Type" ILIKE '%' || search_text || '%' THEN 0.8 ELSE 0 END,
      -- Word boundary matches
      CASE WHEN s."Store_Name" ILIKE search_text || '%' THEN 0.7 ELSE 0 END,
      CASE WHEN s."Store_Type" ILIKE search_text || '%' THEN 0.6 ELSE 0 END,
      -- Incentive program bonus
      CASE WHEN s."Incentive_Program" IS NOT NULL THEN 0.1 ELSE 0 END
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
      s."Store_Name" ILIKE '%' || search_text || '%' OR
      s."Store_Type" ILIKE '%' || search_text || '%'
    )
  ORDER BY 
    similarity_score DESC,
    CASE WHEN s."Incentive_Program" IS NOT NULL THEN 0 ELSE 1 END,
    s."Store_Name" ASC
  LIMIT result_limit;
END;
$$;