-- Fix function security by setting explicit search_path
CREATE OR REPLACE FUNCTION public.update_store_with_google_data(
  p_store_id UUID,
  p_place_id TEXT,
  p_name TEXT,
  p_formatted_address TEXT,
  p_website TEXT,
  p_phone TEXT,
  p_opening_hours JSONB,
  p_rating NUMERIC,
  p_user_ratings_total INTEGER,
  p_photos JSONB
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
    google_last_updated = now()
  WHERE id = p_store_id;
END;
$$;