-- Performance Optimization Migration (Fixed)
-- Issue: get_nearby_stores takes ~2s, smart_store_search takes ~2.8s

-- 1. Create a more efficient composite index for location + incentive queries
CREATE INDEX IF NOT EXISTS idx_snap_stores_location_incentive 
ON public.snap_stores ("Latitude", "Longitude", "Incentive_Program")
WHERE "Latitude" IS NOT NULL AND "Longitude" IS NOT NULL AND "Store_Name" IS NOT NULL AND "Store_Name" != '';

-- 2. Create index for store_clicks trending queries (without time-based predicate)
CREATE INDEX IF NOT EXISTS idx_store_clicks_store_time 
ON public.store_clicks (store_id, clicked_at DESC);

-- 3. Optimize get_nearby_stores function - use bounding box filter BEFORE haversine
CREATE OR REPLACE FUNCTION public.get_nearby_stores(
  user_lat double precision, 
  user_lng double precision, 
  radius_miles double precision DEFAULT 10, 
  store_types text[] DEFAULT NULL::text[], 
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
  distance_miles double precision
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  lat_delta DOUBLE PRECISION;
  lng_delta DOUBLE PRECISION;
BEGIN
  -- Pre-calculate bounding box (10% buffer to catch edge cases)
  lat_delta := radius_miles / 69.0 * 1.1;
  lng_delta := radius_miles / (69.0 * cos(radians(user_lat))) * 1.1;
  
  RETURN QUERY
  WITH bounded_stores AS (
    -- First pass: cheap bounding box filter using index
    SELECT 
      s.id,
      s."Store_Name",
      s."Store_Street_Address",
      s."City",
      s."State",
      s."Zip_Code",
      s."Store_Type",
      s."Latitude",
      s."Longitude",
      s."Incentive_Program"
    FROM snap_stores s
    WHERE 
      s."Latitude" BETWEEN (user_lat - lat_delta) AND (user_lat + lat_delta)
      AND s."Longitude" BETWEEN (user_lng - lng_delta) AND (user_lng + lng_delta)
      AND s."Store_Name" IS NOT NULL
      AND s."Store_Name" != ''
      AND (store_types IS NULL OR s."Store_Type" = ANY(store_types))
  ),
  with_distance AS (
    -- Second pass: calculate actual distance only for bounding box results
    SELECT 
      bs.*,
      (
        3959 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(user_lat)) * 
            cos(radians(bs."Latitude")) * 
            cos(radians(bs."Longitude") - radians(user_lng)) + 
            sin(radians(user_lat)) * 
            sin(radians(bs."Latitude"))
          ))
        )
      ) as calc_distance
    FROM bounded_stores bs
  )
  SELECT 
    wd.id,
    wd."Store_Name" as store_name,
    wd."Store_Street_Address" as store_street_address,
    wd."City" as city,
    wd."State" as state,
    wd."Zip_Code" as zip_code,
    wd."Store_Type" as store_type,
    wd."Latitude" as latitude,
    wd."Longitude" as longitude,
    wd.calc_distance as distance_miles
  FROM with_distance wd
  WHERE wd.calc_distance <= radius_miles
  ORDER BY 
    CASE WHEN wd."Incentive_Program" IS NOT NULL THEN 0 ELSE 1 END,
    wd.calc_distance ASC,
    wd."Store_Name" ASC
  LIMIT result_limit;
END;
$function$;

-- 4. Optimize smart_store_search - reduce regex operations and use CTEs
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
  search_pattern text;
BEGIN
  search_pattern := '%' || search_text || '%';
  
  RETURN QUERY
  WITH filtered_stores AS (
    -- First: apply cheap filters using GIN indexes
    SELECT 
      s.id,
      s."Store_Name",
      s."Store_Street_Address",
      s."City",
      s."State",
      s."Zip_Code",
      s."Store_Type",
      s."Latitude",
      s."Longitude",
      s."Incentive_Program"
    FROM snap_stores s
    WHERE 
      s."Latitude" IS NOT NULL 
      AND s."Longitude" IS NOT NULL
      AND s."Store_Name" IS NOT NULL
      AND s."Store_Name" != ''
      AND (search_zip = '' OR s."Zip_Code" LIKE search_zip || '%')
      AND (search_city = '' OR s."City" ILIKE '%' || search_city || '%')
      AND (search_state = '' OR s."State" ILIKE search_state || '%')
      AND (
        search_text = '' OR
        s."Store_Name" ILIKE search_pattern OR
        s."Store_Type" ILIKE search_pattern
      )
  ),
  scored_stores AS (
    SELECT 
      fs.*,
      GREATEST(
        CASE WHEN fs."Store_Name" ILIKE search_pattern THEN 0.9::REAL ELSE 0::REAL END,
        CASE WHEN fs."Store_Type" ILIKE search_pattern THEN 0.8::REAL ELSE 0::REAL END,
        CASE WHEN fs."Store_Name" ILIKE search_text || '%' THEN 0.7::REAL ELSE 0::REAL END,
        CASE WHEN fs."Store_Type" ILIKE search_text || '%' THEN 0.6::REAL ELSE 0::REAL END,
        CASE WHEN fs."Incentive_Program" IS NOT NULL THEN 0.1::REAL ELSE 0::REAL END
      ) as calc_score
    FROM filtered_stores fs
  )
  SELECT 
    ss.id,
    ss."Store_Name" as store_name,
    ss."Store_Street_Address" as store_street_address,
    ss."City" as city,
    ss."State" as state,
    ss."Zip_Code" as zip_code,
    ss."Store_Type" as store_type,
    ss."Latitude" as latitude,
    ss."Longitude" as longitude,
    ss.calc_score as similarity_score
  FROM scored_stores ss
  ORDER BY 
    ss.calc_score DESC,
    CASE WHEN ss."Incentive_Program" IS NOT NULL THEN 0 ELSE 1 END,
    ss."Store_Name" ASC
  LIMIT result_limit;
END;
$function$;

-- 5. Add index on ObjectId for review lookups
CREATE INDEX IF NOT EXISTS idx_snap_stores_objectid 
ON public.snap_stores ("ObjectId") 
WHERE "ObjectId" IS NOT NULL;

-- 6. Refresh statistics for query planner
ANALYZE public.snap_stores;
ANALYZE public.store_clicks;