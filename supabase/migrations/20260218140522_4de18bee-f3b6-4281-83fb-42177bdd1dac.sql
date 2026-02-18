-- Fix 1: Add authorization checks to SECURITY DEFINER functions
-- update_store_with_google_data: only callable by service_role or admin
CREATE OR REPLACE FUNCTION public.update_store_with_google_data(
  p_store_id uuid, p_place_id text, p_name text, p_formatted_address text,
  p_website text, p_phone text, p_opening_hours jsonb, p_rating numeric,
  p_user_ratings_total integer, p_photos jsonb, p_types jsonb DEFAULT NULL::jsonb,
  p_price_level integer DEFAULT NULL::integer, p_geometry jsonb DEFAULT NULL::jsonb,
  p_business_status text DEFAULT NULL::text, p_vicinity text DEFAULT NULL::text,
  p_icon text DEFAULT NULL::text, p_icon_background_color text DEFAULT NULL::text,
  p_icon_mask_base_uri text DEFAULT NULL::text, p_plus_code text DEFAULT NULL::text,
  p_reviews jsonb DEFAULT NULL::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow service_role or admin users to call this function
  IF (auth.jwt() ->> 'role') != 'service_role' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: service_role or admin required';
  END IF;

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
$$;

-- update_sync_queue_status: only callable by service_role or admin
CREATE OR REPLACE FUNCTION public.update_sync_queue_status(
  queue_id uuid, new_status text, error_msg text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow service_role or admin users to call this function
  IF (auth.jwt() ->> 'role') != 'service_role' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: service_role or admin required';
  END IF;

  UPDATE public.google_places_sync_queue
  SET 
    status = new_status,
    error_message = error_msg,
    retry_count = CASE WHEN new_status = 'failed' THEN retry_count + 1 ELSE retry_count END,
    updated_at = NOW()
  WHERE id = queue_id;
END;
$$;

-- Fix 2: Add proper RLS storage policies for blog-images bucket
-- Restrict uploads to admins only; public read is fine (bucket is already public)
CREATE POLICY "Only admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');