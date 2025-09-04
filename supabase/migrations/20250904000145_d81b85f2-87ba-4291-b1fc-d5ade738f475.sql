-- Fix Google Places cache constraints and add bulk sync support
-- The current constraints are causing ON CONFLICT issues in the edge function

-- First, let's create a more reliable primary constraint for caching
-- Drop the conflicting unique constraints that are causing issues
DROP INDEX IF EXISTS unique_search_query_place_id;
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

-- Populate initial sync queue with stores that need Google Places data
-- Prioritize by location clustering (major cities first)
INSERT INTO public.google_places_sync_queue (store_id, priority)
SELECT 
  s.id,
  CASE 
    -- Priority 1: Major metro areas without Google data
    WHEN s."City" ILIKE ANY(ARRAY['%new york%', '%los angeles%', '%chicago%', '%houston%', '%phoenix%', '%philadelphia%', '%san antonio%', '%san diego%', '%dallas%', '%austin%']) 
         AND s.google_place_id IS NULL THEN 1
    -- Priority 2: Other large cities without Google data  
    WHEN s."City" ILIKE ANY(ARRAY['%fort worth%', '%columbus%', '%charlotte%', '%san francisco%', '%indianapolis%', '%seattle%', '%denver%', '%washington%', '%boston%', '%nashville%'])
         AND s.google_place_id IS NULL THEN 2
    -- Priority 3: Stores with old Google data (>60 days)
    WHEN s.google_place_id IS NOT NULL 
         AND s.google_last_updated < NOW() - INTERVAL '60 days' THEN 3
    -- Priority 4: Stores without Google data in populated areas
    WHEN s.google_place_id IS NULL 
         AND s."State" IN ('CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI') THEN 4
    -- Priority 5: All other stores without Google data
    WHEN s.google_place_id IS NULL THEN 5
    -- Priority 6: Stores with moderately old data (30-60 days)
    WHEN s.google_last_updated < NOW() - INTERVAL '30 days' THEN 6
    ELSE 10 -- Lowest priority for everything else
  END as priority
FROM public.snap_stores s
WHERE (
  s.google_place_id IS NULL 
  OR s.google_last_updated < NOW() - INTERVAL '30 days'
  OR s.google_last_updated IS NULL
)
AND s."Store_Name" IS NOT NULL 
AND s."Store_Name" != ''
AND s."Latitude" IS NOT NULL 
AND s."Longitude" IS NOT NULL
ON CONFLICT (store_id) DO NOTHING;

-- Add function to get next batch of stores for processing
CREATE OR REPLACE FUNCTION public.get_next_sync_batch(batch_size INTEGER DEFAULT 50)
RETURNS TABLE(
  queue_id UUID,
  store_id UUID,
  store_name TEXT,
  store_address TEXT,
  city TEXT,
  state TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  priority INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark stores as processing and return them
  RETURN QUERY
  WITH next_batch AS (
    UPDATE public.google_places_sync_queue
    SET 
      status = 'processing',
      last_attempt_at = NOW(),
      updated_at = NOW()
    WHERE id IN (
      SELECT q.id
      FROM public.google_places_sync_queue q
      WHERE q.status = 'pending'
        AND (q.retry_count < 3 OR q.last_attempt_at < NOW() - INTERVAL '1 hour')
      ORDER BY q.priority ASC, q.created_at ASC
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    )
    RETURNING q.id as queue_id, q.store_id, q.priority
  )
  SELECT 
    nb.queue_id,
    nb.store_id,
    s."Store_Name" as store_name,
    s."Store_Street_Address" as store_address,
    s."City" as city,
    s."State" as state,
    s."Latitude" as latitude,
    s."Longitude" as longitude,
    nb.priority
  FROM next_batch nb
  JOIN public.snap_stores s ON s.id = nb.store_id;
END;
$$;