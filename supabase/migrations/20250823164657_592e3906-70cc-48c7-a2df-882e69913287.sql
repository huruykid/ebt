-- Fix search path security issue for the function
CREATE OR REPLACE FUNCTION public.get_stores_with_fresh_google_data(days_threshold integer DEFAULT 30)
RETURNS TABLE(
  id uuid,
  store_name text,
  google_place_id text,
  google_last_updated timestamp with time zone
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s."Store_Name" as store_name,
    s.google_place_id,
    s.google_last_updated
  FROM snap_stores s
  WHERE s.google_place_id IS NOT NULL 
    AND s.google_last_updated > (now() - (days_threshold || ' days')::interval);
END;
$$;