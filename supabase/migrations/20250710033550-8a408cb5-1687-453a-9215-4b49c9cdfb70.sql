-- Fix function search path issues by adding SET search_path
CREATE OR REPLACE FUNCTION public.auto_award_badges()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  -- Check and award badges for the user
  PERFORM public.check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.smart_store_search(search_text text DEFAULT ''::text, search_city text DEFAULT ''::text, search_state text DEFAULT ''::text, search_zip text DEFAULT ''::text, similarity_threshold real DEFAULT 0.3, result_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, store_name text, store_street_address text, city text, state text, zip_code text, store_type text, latitude double precision, longitude double precision, similarity_score real)
 LANGUAGE plpgsql
 SET search_path TO 'public'
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
      similarity(s."City", search_city) > 0.4 OR
      s."City" ILIKE '%' || search_city || '%'
    )
    AND (
      search_state = '' OR
      s."State" ILIKE search_state OR
      similarity(s."State", search_state) > 0.4 OR
      s."State" ILIKE '%' || search_state || '%'
    )
    AND (
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

CREATE OR REPLACE FUNCTION public.get_nearby_stores(user_lat double precision, user_lng double precision, radius_miles double precision DEFAULT 10, store_types text[] DEFAULT NULL::text[], result_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, store_name text, store_street_address text, city text, state text, zip_code text, store_type text, latitude double precision, longitude double precision, distance_miles double precision)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
DECLARE
  lat_delta DOUBLE PRECISION;
  lng_delta DOUBLE PRECISION;
BEGIN
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
    AND s."Latitude" BETWEEN (user_lat - lat_delta) AND (user_lat + lat_delta)
    AND s."Longitude" BETWEEN (user_lng - lng_delta) AND (user_lng + lng_delta)
    AND (store_types IS NULL OR s."Store_Type" = ANY(store_types))
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

-- Create extensions schema and move pg_trgm there
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Remove the materialized view from API access by dropping it
-- (It seems to be accessible and causing warnings)
DROP MATERIALIZED VIEW IF EXISTS public.store_type_stats;