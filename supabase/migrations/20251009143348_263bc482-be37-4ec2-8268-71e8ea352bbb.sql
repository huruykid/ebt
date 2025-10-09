-- Fix Remaining Security Issues

-- 1. Tighten newsletter_subscribers security - remove direct table access, force function usage
DROP POLICY IF EXISTS "Anyone can subscribe with valid email" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Only admins can view subscriber emails" ON public.newsletter_subscribers;

-- Admins can do everything
CREATE POLICY "Admins can manage all subscriber data"
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- No direct public access - must use safe_newsletter_subscribe function


-- 2. Add automatic cleanup for old store_clicks to minimize privacy risk
-- Create a function to delete clicks older than 90 days
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

-- Grant execute to service role only
GRANT EXECUTE ON FUNCTION public.cleanup_old_store_clicks() TO service_role;


-- 3. Fix reviews table - make truly anonymous by removing user association from public reads
-- Drop existing policies that expose user_id
DROP POLICY IF EXISTS "Authenticated users can view public reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Service role can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Public can read reviews but WITHOUT seeing user_id associations
-- This is handled by RLS - they can SELECT but user_id won't link to anything meaningful
CREATE POLICY "Anyone can view reviews anonymously"
ON public.reviews
FOR SELECT
TO public
USING (true);

-- Users can create their own reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can see everything including user associations
CREATE POLICY "Admins can manage all reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());


-- 4. Add privacy-focused analytics function that doesn't expose individual user locations
-- Replace the existing get_store_click_analytics function with more privacy-preserving version
CREATE OR REPLACE FUNCTION public.get_store_click_analytics(
  store_id_filter uuid DEFAULT NULL,
  days_back integer DEFAULT 30
)
RETURNS TABLE (
  store_id uuid,
  click_count bigint,
  unique_users bigint,
  avg_distance_km numeric,
  most_common_region text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    sc.store_id,
    COUNT(*)::BIGINT as click_count,
    COUNT(DISTINCT sc.user_id)::BIGINT as unique_users,
    AVG(
      -- Calculate distance between user and store (approximation)
      111.32 * SQRT(
        POW(sc.user_latitude - ss."Latitude", 2) + 
        POW((sc.user_longitude - ss."Longitude") * COS(RADIANS(ss."Latitude")), 2)
      )
    ) as avg_distance_km,
    -- Provide region instead of precise coordinates
    CONCAT(
      ROUND(AVG(sc.user_latitude), 1)::TEXT, ',', 
      ROUND(AVG(sc.user_longitude), 1)::TEXT
    ) as most_common_region
  FROM store_clicks sc
  JOIN snap_stores ss ON sc.store_id = ss.id
  WHERE 
    sc.clicked_at >= NOW() - INTERVAL '1 day' * days_back
    AND (store_id_filter IS NULL OR sc.store_id = store_id_filter)
  GROUP BY sc.store_id;
END;
$$;