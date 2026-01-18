-- Fix get_nearby_stores to prioritize distance over incentive program
-- The incentive prioritization was causing far-away incentive stores to appear before nearby stores

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
SET search_path = public
AS $$
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
    -- CHANGED: Prioritize distance first, then incentive program as tiebreaker
    -- This ensures users see the closest stores first, not far-away incentive stores
    wd.calc_distance ASC,
    CASE WHEN wd."Incentive_Program" IS NOT NULL THEN 0 ELSE 1 END,
    wd."Store_Name" ASC
  LIMIT result_limit;
END;
$$;