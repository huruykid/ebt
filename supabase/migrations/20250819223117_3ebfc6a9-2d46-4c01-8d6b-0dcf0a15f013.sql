-- Add Google Places fields to snap_stores table for enriched data
ALTER TABLE public.snap_stores 
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_name TEXT,
ADD COLUMN IF NOT EXISTS google_formatted_address TEXT,
ADD COLUMN IF NOT EXISTS google_website TEXT,
ADD COLUMN IF NOT EXISTS google_formatted_phone_number TEXT,
ADD COLUMN IF NOT EXISTS google_opening_hours JSONB,
ADD COLUMN IF NOT EXISTS google_rating NUMERIC(2,1),
ADD COLUMN IF NOT EXISTS google_user_ratings_total INTEGER,
ADD COLUMN IF NOT EXISTS google_photos JSONB,
ADD COLUMN IF NOT EXISTS google_last_updated TIMESTAMPTZ;

-- Create index on google_place_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_snap_stores_google_place_id ON public.snap_stores (google_place_id);

-- Create function to update store with Google Places data
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
) RETURNS VOID LANGUAGE plpgsql AS $$
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