-- Expand update_store_with_google_data function to handle all Google Places fields
DROP FUNCTION IF EXISTS public.update_store_with_google_data(uuid, text, text, text, text, text, jsonb, numeric, integer, jsonb);

CREATE OR REPLACE FUNCTION public.update_store_with_google_data(
  p_store_id uuid,
  p_place_id text,
  p_name text,
  p_formatted_address text,
  p_website text,
  p_phone text,
  p_opening_hours jsonb,
  p_rating numeric,
  p_user_ratings_total integer,
  p_photos jsonb,
  -- New comprehensive fields
  p_types jsonb DEFAULT NULL,
  p_price_level integer DEFAULT NULL,
  p_geometry jsonb DEFAULT NULL,
  p_business_status text DEFAULT NULL,
  p_vicinity text DEFAULT NULL,
  p_icon text DEFAULT NULL,
  p_icon_background_color text DEFAULT NULL,
  p_icon_mask_base_uri text DEFAULT NULL,
  p_plus_code text DEFAULT NULL,
  p_reviews jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.snap_stores 
  SET 
    google_place_id = p_place_id,
    google_name = p_name,
    google_formatted_address = p_formatted_address,
    google_website = p_website,
    google_formatted_phone_number = p_phone,
    google_opening_hours = p_opening_hours,
    google_rating = p_rating,
    google_user_ratings_total = p_user_ratings_total,
    google_photos = p_photos,
    google_types = p_types,
    google_price_level = p_price_level,
    google_geometry = p_geometry,
    google_business_status = p_business_status,
    google_vicinity = p_vicinity,
    google_icon = p_icon,
    google_icon_background_color = p_icon_background_color,
    google_icon_mask_base_uri = p_icon_mask_base_uri,
    google_plus_code = p_plus_code,
    google_reviews = p_reviews,
    google_last_updated = now()
  WHERE id = p_store_id;
END;
$function$;