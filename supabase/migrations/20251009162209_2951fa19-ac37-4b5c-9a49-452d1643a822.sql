-- Comprehensive Security Fixes Migration

-- ============================================
-- PHASE 1: CRITICAL PRIVACY FIXES
-- ============================================

-- 1. Create public_reviews view (excludes user_id for privacy)
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
  id,
  store_id,
  rating,
  review_text,
  created_at,
  updated_at
FROM public.reviews;

-- Grant access to the view
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- 2. Create public_store_comments view (excludes user_id for privacy)
CREATE OR REPLACE VIEW public.public_store_comments AS
SELECT 
  id,
  store_id,
  comment_text,
  user_name,
  created_at,
  updated_at
FROM public.store_comments;

-- Grant access to the view
GRANT SELECT ON public.public_store_comments TO anon, authenticated;

-- 3. Update store_comments RLS policies to prevent direct public access
DROP POLICY IF EXISTS "Anyone can view store comments" ON public.store_comments;

-- Only authenticated users can see their own comments with user_id
CREATE POLICY "Users can view their own comments with user_id"
ON public.store_comments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can see everything
CREATE POLICY "Admins can view all comments with user_id"
ON public.store_comments
FOR SELECT
TO authenticated
USING (is_admin_user());

-- Keep existing insert policy
-- (Already restricts: auth.uid() = user_id)

-- ============================================
-- PHASE 2: MEDIUM PRIORITY IMPROVEMENTS
-- ============================================

-- 4. Add positive RLS policy for profiles (defense-in-depth)
CREATE POLICY "Users can explicitly view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Keep existing deny-all policy as backup

-- 5. Schedule automatic cleanup of old store_clicks data (pg_cron)
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly cleanup job (runs every Sunday at 2 AM UTC)
SELECT cron.schedule(
  'cleanup-old-store-clicks',
  '0 2 * * 0',  -- Every Sunday at 2 AM
  $$SELECT public.cleanup_old_store_clicks();$$
);

-- Log the cron job creation
DO $$
BEGIN
  RAISE NOTICE 'Security fixes applied successfully:
    ✓ Created public_reviews view (privacy-safe)
    ✓ Created public_store_comments view (privacy-safe)
    ✓ Updated RLS policies to prevent user tracking
    ✓ Added positive SELECT policy for profiles
    ✓ Scheduled automatic cleanup of old location data';
END $$;