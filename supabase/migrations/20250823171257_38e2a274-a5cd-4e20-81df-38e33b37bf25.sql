-- Harden truncate_coordinates function per linter (set search_path)
CREATE OR REPLACE FUNCTION public.truncate_coordinates(lat NUMERIC, lng NUMERIC)
RETURNS TABLE(truncated_lat NUMERIC, truncated_lng NUMERIC)
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY SELECT 
    ROUND(lat::numeric, 3) as truncated_lat,
    ROUND(lng::numeric, 3) as truncated_lng;
END;
$$;