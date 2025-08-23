-- Create Google Places cache table for cost optimization
CREATE TABLE public.google_places_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id TEXT UNIQUE,
  search_query TEXT NOT NULL, -- Store name + address for matching
  business_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cache_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '120 days')
);

-- Enable RLS
ALTER TABLE public.google_places_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for app users, write for functions)
CREATE POLICY "Anyone can view cached places data" 
ON public.google_places_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage cache data" 
ON public.google_places_cache 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_google_places_cache_search_query ON public.google_places_cache(search_query);
CREATE INDEX idx_google_places_cache_place_id ON public.google_places_cache(place_id) WHERE place_id IS NOT NULL;
CREATE INDEX idx_google_places_cache_expires ON public.google_places_cache(cache_expires_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_google_places_cache_updated_at
BEFORE UPDATE ON public.google_places_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();