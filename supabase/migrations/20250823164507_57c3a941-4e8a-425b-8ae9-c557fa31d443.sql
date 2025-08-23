-- Add comprehensive Google Places data fields to snap_stores table
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_reviews jsonb;
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_types jsonb;
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_price_level integer;
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_plus_code text;
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_business_status text;
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_geometry jsonb;
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_vicinity text;
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_icon text;
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_icon_background_color text;
ALTER TABLE public.snap_stores ADD COLUMN IF NOT EXISTS google_icon_mask_base_uri text;

-- Add index for better performance on Google Places lookups
CREATE INDEX IF NOT EXISTS idx_snap_stores_google_place_id ON public.snap_stores(google_place_id);
CREATE INDEX IF NOT EXISTS idx_snap_stores_google_last_updated ON public.snap_stores(google_last_updated);

-- Add a function to get stores with fresh Google data (less than 30 days old)
CREATE OR REPLACE FUNCTION public.get_stores_with_fresh_google_data(days_threshold integer DEFAULT 30)
RETURNS TABLE(
  id uuid,
  store_name text,
  google_place_id text,
  google_last_updated timestamp with time zone
) 
LANGUAGE plpgsql
STABLE
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