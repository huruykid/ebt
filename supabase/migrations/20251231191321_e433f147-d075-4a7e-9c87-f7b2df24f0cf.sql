-- Fix the get_next_sync_batch function - the RETURNING clause was incorrectly using 'q.' alias
CREATE OR REPLACE FUNCTION public.get_next_sync_batch(batch_size integer DEFAULT 50)
RETURNS TABLE(queue_id uuid, store_id uuid, store_name text, store_address text, city text, state text, latitude double precision, longitude double precision, priority integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    RETURNING google_places_sync_queue.id as queue_id, google_places_sync_queue.store_id, google_places_sync_queue.priority
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
$function$;