
-- Performance and Search Optimization Indexes for SNAP Stores
-- (Fixed version without CONCURRENTLY for transaction compatibility)

-- 1. Primary search indexes for store names and types
CREATE INDEX IF NOT EXISTS idx_snap_stores_store_name_gin 
ON snap_stores USING gin("Store_Name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_snap_stores_store_type_gin 
ON snap_stores USING gin("Store_Type" gin_trgm_ops);

-- 2. Location-based indexes for geographic queries
CREATE INDEX IF NOT EXISTS idx_snap_stores_location 
ON snap_stores USING btree("Latitude", "Longitude") 
WHERE "Latitude" IS NOT NULL AND "Longitude" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_snap_stores_city_gin 
ON snap_stores USING gin("City" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_snap_stores_zip_code 
ON snap_stores USING btree("Zip_Code") 
WHERE "Zip_Code" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_snap_stores_state 
ON snap_stores USING btree("State");

-- 3. Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_snap_stores_type_location 
ON snap_stores USING btree("Store_Type", "State", "City") 
WHERE "Latitude" IS NOT NULL AND "Longitude" IS NOT NULL;

-- 4. Incentive program index for premium stores
CREATE INDEX IF NOT EXISTS idx_snap_stores_incentive 
ON snap_stores USING btree("Incentive_Program") 
WHERE "Incentive_Program" IS NOT NULL;

-- 5. Optimize the smart search function with better performance
DROP FUNCTION IF EXISTS public.smart_store_search(TEXT, TEXT, TEXT, REAL, INTEGER);

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
      CASE WHEN search_text = '' THEN 0 
           ELSE COALESCE(similarity(s."Store_Name", search_text), 0) END,
      CASE WHEN search_text = '' THEN 0 
           ELSE COALESCE(similarity(s."Store_Type", search_text), 0) END,
      CASE WHEN s."Incentive_Program" IS NOT NULL THEN 0.1 ELSE 0 END
    ) as similarity_score
  FROM snap_stores s
  WHERE 
    -- Ensure valid coordinates first (most selective)
    s."Latitude" IS NOT NULL 
    AND s."Longitude" IS NOT NULL
    AND s."Store_Name" IS NOT NULL
    AND s."Store_Name" != ''
    AND
    -- Location filters (apply early for performance)
    (
      search_zip = '' OR
      s."Zip_Code" = search_zip OR
      s."Zip_Code" LIKE search_zip || '%'
    )
    AND
    (
      search_city = '' OR
      s."City" ILIKE search_city OR
      similarity(s."City", search_city) > 0.4 OR
      s."City" ILIKE '%' || search_city || '%'
    )
    AND
    -- Text search with optimized conditions
    (
      search_text = '' OR
      s."Store_Name" ILIKE '%' || search_text || '%' OR
      s."Store_Type" ILIKE '%' || search_text || '%' OR
      similarity(s."Store_Name", search_text) > similarity_threshold OR
      similarity(s."Store_Type", search_text) > similarity_threshold
    )
  ORDER BY 
    similarity_score DESC,
    CASE WHEN s."Incentive_Program" IS NOT NULL THEN 0 ELSE 1 END,
    s."Store_Name" ASC
  LIMIT result_limit;
END;
$$;

-- 6. Create function for fast nearby store search with better performance
CREATE OR REPLACE FUNCTION public.get_nearby_stores(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION DEFAULT 10,
  store_types TEXT[] DEFAULT NULL,
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
  distance_miles DOUBLE PRECISION
) 
LANGUAGE plpgsql
AS $$
DECLARE
  lat_delta DOUBLE PRECISION;
  lng_delta DOUBLE PRECISION;
BEGIN
  -- Calculate bounding box for initial filtering
  lat_delta := radius_miles / 69.0;
  lng_delta := radius_miles / (69.0 * cos(radians(user_lat)));
  
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
    (
      3959 * acos(
        cos(radians(user_lat)) * 
        cos(radians(s."Latitude")) * 
        cos(radians(s."Longitude") - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(s."Latitude"))
      )
    ) as distance_miles
  FROM snap_stores s
  WHERE 
    s."Latitude" IS NOT NULL 
    AND s."Longitude" IS NOT NULL
    AND s."Store_Name" IS NOT NULL
    AND s."Store_Name" != ''
    -- Bounding box filter (fast)
    AND s."Latitude" BETWEEN (user_lat - lat_delta) AND (user_lat + lat_delta)
    AND s."Longitude" BETWEEN (user_lng - lng_delta) AND (user_lng + lng_delta)
    -- Store type filter (if provided)
    AND (store_types IS NULL OR s."Store_Type" = ANY(store_types))
    -- Precise distance filter
    AND (
      3959 * acos(
        cos(radians(user_lat)) * 
        cos(radians(s."Latitude")) * 
        cos(radians(s."Longitude") - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(s."Latitude"))
      )
    ) <= radius_miles
  ORDER BY 
    CASE WHEN s."Incentive_Program" IS NOT NULL THEN 0 ELSE 1 END,
    distance_miles ASC,
    s."Store_Name" ASC
  LIMIT result_limit;
END;
$$;

-- 7. Create materialized view for store statistics (for analytics)
CREATE MATERIALIZED VIEW IF NOT EXISTS store_type_stats AS
SELECT 
  "Store_Type",
  "State",
  COUNT(*) as store_count,
  COUNT(CASE WHEN "Incentive_Program" IS NOT NULL THEN 1 END) as incentive_stores
FROM snap_stores 
WHERE "Store_Name" IS NOT NULL 
  AND "Store_Name" != ''
  AND "Latitude" IS NOT NULL 
  AND "Longitude" IS NOT NULL
GROUP BY "Store_Type", "State"
ORDER BY store_count DESC;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_store_type_stats_type ON store_type_stats("Store_Type");
CREATE INDEX IF NOT EXISTS idx_store_type_stats_state ON store_type_stats("State");

-- 8. Update table statistics for better query planning
ANALYZE snap_stores;
