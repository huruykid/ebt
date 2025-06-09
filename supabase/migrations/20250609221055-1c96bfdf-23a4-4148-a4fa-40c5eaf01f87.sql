
-- Create a table to track store clicks for trending analysis
CREATE TABLE public.store_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id BIGINT REFERENCES public.snap_stores(id) NOT NULL,
  user_latitude NUMERIC NOT NULL,
  user_longitude NUMERIC NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users NULL -- optional, for authenticated users
);

-- Add index for efficient querying by location and time
CREATE INDEX idx_store_clicks_location_time ON public.store_clicks 
  (user_latitude, user_longitude, clicked_at DESC);

-- Add index for efficient querying by store and time
CREATE INDEX idx_store_clicks_store_time ON public.store_clicks 
  (store_id, clicked_at DESC);
