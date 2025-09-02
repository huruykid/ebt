-- Fix the google_places_cache table constraint issue
-- The ON CONFLICT requires a unique constraint
ALTER TABLE public.google_places_cache 
ADD CONSTRAINT unique_search_query_place_id UNIQUE (search_query, place_id);

-- Fix the reviews table foreign key relationship
-- Add proper foreign key to profiles table
ALTER TABLE public.reviews 
ADD CONSTRAINT fk_reviews_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create missing indexes for better SEO performance
CREATE INDEX IF NOT EXISTS idx_snap_stores_store_type ON public.snap_stores ("Store_Type");
CREATE INDEX IF NOT EXISTS idx_snap_stores_city_state ON public.snap_stores ("City", "State");
CREATE INDEX IF NOT EXISTS idx_snap_stores_zip_code ON public.snap_stores ("Zip_Code");
CREATE INDEX IF NOT EXISTS idx_snap_stores_google_place_id ON public.snap_stores (google_place_id) WHERE google_place_id IS NOT NULL;

-- Create index for google places cache performance (without time-based predicate)
CREATE INDEX IF NOT EXISTS idx_google_places_cache_search_query ON public.google_places_cache (search_query);
CREATE INDEX IF NOT EXISTS idx_google_places_cache_place_id ON public.google_places_cache (place_id) WHERE place_id IS NOT NULL;