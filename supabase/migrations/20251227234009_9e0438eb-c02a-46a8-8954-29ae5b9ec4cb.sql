-- Add automatic data retention for store_clicks (30-day cleanup already exists as function)
-- Create a scheduled job pattern using pg_cron extension (if available) or document manual cleanup

-- First, let's add a retention policy comment and ensure the cleanup function is properly callable
COMMENT ON TABLE public.store_clicks IS 'User store click tracking with 30-day retention policy. Coordinates are rounded to 2 decimal places (~1km precision) for privacy. Use cleanup_old_store_clicks() function for data purging.';

-- Update the cleanup function to be more aggressive - 7 days instead of 30
CREATE OR REPLACE FUNCTION public.cleanup_old_store_clicks()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.store_clicks
  WHERE clicked_at < NOW() - INTERVAL '7 days';
END;
$function$;

-- Add index on clicked_at for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_store_clicks_clicked_at ON public.store_clicks(clicked_at);

-- For newsletter_subscribers, the safe_newsletter_subscribe function already handles all inserts securely
-- Add a comment documenting the security model
COMMENT ON TABLE public.newsletter_subscribers IS 'Newsletter subscriptions. All inserts MUST go through safe_newsletter_subscribe() function. Direct table access is admin-only via RLS.';

-- Ensure the RLS policies are airtight - drop and recreate with explicit deny-first approach
DROP POLICY IF EXISTS "Deny non-admin direct access to newsletter subscribers" ON public.newsletter_subscribers;

-- Create explicit deny policy for non-admins on all operations
CREATE POLICY "Only admins can access newsletter_subscribers directly" 
ON public.newsletter_subscribers
FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());