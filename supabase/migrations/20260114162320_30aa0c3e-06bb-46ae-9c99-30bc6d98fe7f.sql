-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a daily cron job to trigger the blog scheduler at 8 AM UTC
SELECT cron.schedule(
  'daily-snap-blog-generator',
  '0 8 * * *',  -- Run at 8:00 AM UTC every day
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/snap-blog-scheduler',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Add a comment for documentation
COMMENT ON EXTENSION pg_cron IS 'Daily SNAP blog automation runs at 8 AM UTC';