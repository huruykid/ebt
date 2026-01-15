-- Update the trigger function to use the service role key from vault
-- This replaces the hardcoded anon key with a dynamic lookup

CREATE OR REPLACE FUNCTION public.trigger_snap_blog_scheduler()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
  service_key text;
  supabase_url text := 'https://vpnaaaocqqmkslwqrkyd.supabase.co';
BEGIN
  -- Get the service role key from vault
  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_service_role_key'
  LIMIT 1;

  -- If vault lookup fails, try the built-in service role key
  IF service_key IS NULL THEN
    -- Use a fallback approach - log warning and skip
    RAISE WARNING 'Service role key not found in vault. Scheduler cannot run securely.';
    RETURN;
  END IF;

  -- Make HTTP request to the edge function with service role authentication
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/snap-blog-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := '{}'::jsonb
  ) INTO request_id;
  
  RAISE NOTICE 'Snap blog scheduler triggered with request_id: %', request_id;
END;
$$;