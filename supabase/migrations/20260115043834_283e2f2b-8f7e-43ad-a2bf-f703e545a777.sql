-- First, unschedule the existing job if it exists
SELECT cron.unschedule('daily-snap-blog-generator') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-snap-blog-generator');

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a function to trigger the blog scheduler
CREATE OR REPLACE FUNCTION public.trigger_snap_blog_scheduler()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the edge function using pg_net
  SELECT net.http_post(
    url := 'https://vpnaaaocqqmkslwqrkyd.supabase.co/functions/v1/snap-blog-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbmFhYW9jcXFta3Nsd3Fya3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5NTQ4ODAsImV4cCI6MjA0MjUzMDg4MH0.xgNV7k5M_EAq-u1YxzV0yq3HuVeAZJBeclkR3C49eE4'
    ),
    body := '{}'::jsonb
  ) INTO request_id;
  
  RAISE LOG 'Snap blog scheduler triggered, request_id: %', request_id;
END;
$$;

-- Schedule the cron job to run at 8 AM UTC daily
SELECT cron.schedule(
  'daily-snap-blog-generator',
  '0 8 * * *',
  'SELECT public.trigger_snap_blog_scheduler()'
);

-- Add comment for documentation
COMMENT ON FUNCTION public.trigger_snap_blog_scheduler() IS 'Triggers the SNAP blog scheduler edge function - runs daily at 8 AM UTC via pg_cron';