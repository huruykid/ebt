-- Populate the sync queue with stores that need Google Places data
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

-- Add function to mark sync queue items as completed or failed
CREATE OR REPLACE FUNCTION public.update_sync_queue_status(
  queue_id UUID,
  new_status TEXT,
  error_msg TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.google_places_sync_queue
  SET 
    status = new_status,
    error_message = error_msg,
    retry_count = CASE WHEN new_status = 'failed' THEN retry_count + 1 ELSE retry_count END,
    updated_at = NOW()
  WHERE id = queue_id;
END;
$$;