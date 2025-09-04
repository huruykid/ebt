-- Fix Google Places cache constraints properly
-- Drop the constraints that are causing ON CONFLICT issues

-- Drop the unique constraints (not just indexes)
ALTER TABLE public.google_places_cache DROP CONSTRAINT IF EXISTS unique_search_query_place_id;

-- Drop the unique indexes
DROP INDEX IF EXISTS idx_places_cache_place_details;
DROP INDEX IF EXISTS idx_places_cache_text_search;

-- Create a single comprehensive unique constraint for caching
-- This will handle both text search caching and place details caching
CREATE UNIQUE INDEX idx_google_places_cache_comprehensive 
ON public.google_places_cache (
  COALESCE(search_query, ''), 
  COALESCE(place_id, ''),
  COALESCE(params_hash, ''),
  COALESCE(fields_hash, '')
);

-- Add a table to track bulk sync progress and priorities
CREATE TABLE IF NOT EXISTS public.google_places_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.snap_stores(id),
  priority INTEGER NOT NULL DEFAULT 5, -- 1=highest, 10=lowest
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sync queue
ALTER TABLE public.google_places_sync_queue ENABLE ROW LEVEL SECURITY;

-- Only service role and admins can manage the sync queue
CREATE POLICY "Service role can manage sync queue"
ON public.google_places_sync_queue
FOR ALL
USING (
  (auth.jwt() ->> 'role') = 'service_role' OR
  public.is_admin_user()
);

-- Add indexes for efficient queue processing
CREATE INDEX idx_sync_queue_priority_status ON public.google_places_sync_queue (priority, status, created_at);
CREATE INDEX idx_sync_queue_store_id ON public.google_places_sync_queue (store_id);
CREATE UNIQUE INDEX idx_sync_queue_store_unique ON public.google_places_sync_queue (store_id) 
WHERE status IN ('pending', 'processing');

-- Add trigger for updated_at
CREATE TRIGGER update_sync_queue_updated_at
  BEFORE UPDATE ON public.google_places_sync_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();