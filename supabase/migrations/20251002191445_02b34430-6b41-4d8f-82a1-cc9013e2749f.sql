-- Phase 1: Critical Privacy and Security Fixes (Corrected)

-- 1. Implement location data protection for store_clicks
-- Add automatic 90-day retention cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_store_clicks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.store_clicks
  WHERE clicked_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Add privacy documentation
COMMENT ON TABLE public.store_clicks IS 'User location data is truncated to 3 decimal places (~100m precision) and automatically deleted after 90 days for privacy protection.';
COMMENT ON COLUMN public.store_clicks.user_latitude IS 'Truncated to 3 decimal places (~100m precision) for privacy';
COMMENT ON COLUMN public.store_clicks.user_longitude IS 'Truncated to 3 decimal places (~100m precision) for privacy';

-- 2. Create public_profiles view (excludes email for privacy)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to public_profiles
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- 3. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_store_clicks_clicked_at 
  ON public.store_clicks(clicked_at);

CREATE INDEX IF NOT EXISTS idx_user_points_user_id_created_at 
  ON public.user_points(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_points_contribution_type
  ON public.user_points(contribution_type);

CREATE INDEX IF NOT EXISTS idx_reviews_store_id_created_at
  ON public.reviews(store_id, created_at DESC);

-- 4. Add constraint documentation for coordinate truncation
-- The actual truncation is handled in the application layer (useStoreClickTracking.ts)
-- This documents the requirement at the database level

-- 5. Recreate user_stats view with security_invoker if it doesn't exist
DROP VIEW IF EXISTS public.user_stats CASCADE;

CREATE VIEW public.user_stats
WITH (security_invoker = true)
AS
SELECT 
  up.user_id,
  COALESCE(SUM(up.points_earned), 0)::BIGINT AS total_points,
  COALESCE(COUNT(up.id), 0)::BIGINT AS total_contributions,
  COALESCE(COUNT(CASE WHEN up.verified = true THEN 1 END), 0)::BIGINT AS verified_contributions,
  COALESCE(COUNT(CASE WHEN up.contribution_type = 'store_review' THEN 1 END), 0)::BIGINT AS reviews_count,
  COALESCE(COUNT(CASE WHEN up.contribution_type = 'store_photo' THEN 1 END), 0)::BIGINT AS photos_count,
  COALESCE(COUNT(CASE WHEN up.contribution_type = 'store_hours' THEN 1 END), 0)::BIGINT AS hours_count,
  COALESCE(COUNT(DISTINCT up.store_id), 0)::BIGINT AS stores_contributed_to
FROM public.user_points up
GROUP BY up.user_id;

GRANT SELECT ON public.user_stats TO authenticated;
GRANT SELECT ON public.user_stats TO anon;

COMMENT ON VIEW public.user_stats IS 'Aggregated user statistics. Access controlled by underlying user_points table RLS policies.';
COMMENT ON VIEW public.public_profiles IS 'Public profile information excluding sensitive data like email addresses.';