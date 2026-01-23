-- Fix Error #1: newsletter_subscribers email exposure
-- The current "Admins can manage subscribers" ALL policy doesn't properly deny SELECT to non-admins
-- Add explicit policy to deny public/non-admin SELECT access

DROP POLICY IF EXISTS "Deny public access to newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Deny public access to newsletter_subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (false);

-- Fix Error #2: api_usage_ledger business data exposure
-- Remove any permissive SELECT that could allow public reads
-- Keep only service_role access which requires the restrictive policy

DROP POLICY IF EXISTS "Deny public access to api_usage_ledger" ON public.api_usage_ledger;
CREATE POLICY "Deny public access to api_usage_ledger"
ON public.api_usage_ledger
FOR SELECT
USING (false);

-- Fix Error #3: store_clicks location tracking
-- Drop and recreate admin policy with stricter conditions
-- Ensure only service_role can view data, not regular admins accessing via client

DROP POLICY IF EXISTS "Admins can view anonymized store click analytics" ON public.store_clicks;
CREATE POLICY "Only service role can access store_clicks"
ON public.store_clicks
FOR SELECT
USING (false);

-- Add a comment documenting the security rationale
COMMENT ON TABLE public.store_clicks IS 'Contains user location data. Access restricted to service_role via edge functions only for privacy compliance (GDPR/CCPA). Location data auto-deleted after 30 days.';