-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user has admin role in profiles
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (profiles.full_name ILIKE '%admin%' OR profiles.username ILIKE '%admin%')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Also fix the existing update_store_with_google_data function
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
  p_photos jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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