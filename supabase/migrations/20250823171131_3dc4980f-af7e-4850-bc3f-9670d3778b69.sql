-- Fix security issues in store_clicks table

-- 1. First, let's make user_id non-nullable to prevent anonymous tracking
-- But we need to handle existing null values first
UPDATE store_clicks SET user_id = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE user_id IS NULL;

-- Now make the column non-nullable
ALTER TABLE store_clicks ALTER COLUMN user_id SET NOT NULL;

-- 2. Add a function to reduce location precision (truncate to ~100m accuracy)
-- This preserves analytics value while reducing tracking precision
CREATE OR REPLACE FUNCTION public.truncate_coordinates(lat NUMERIC, lng NUMERIC)
RETURNS TABLE(truncated_lat NUMERIC, truncated_lng NUMERIC)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Truncate to 3 decimal places (~100m precision instead of ~1m)
  -- This reduces tracking precision while maintaining regional analytics
  RETURN QUERY SELECT 
    ROUND(lat::numeric, 3) as truncated_lat,
    ROUND(lng::numeric, 3) as truncated_lng;
END;
$$;

-- 3. Drop and recreate more restrictive RLS policies
DROP POLICY IF EXISTS "Users can create store clicks" ON store_clicks;
DROP POLICY IF EXISTS "Users can view their own store clicks" ON store_clicks;
DROP POLICY IF EXISTS "Admins can view all store clicks" ON store_clicks;

-- 4. Create secure RLS policies
-- Only authenticated users can insert their own clicks
CREATE POLICY "Authenticated users can create their own store clicks"
ON store_clicks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only view their own clicks (aggregated data)
CREATE POLICY "Users can view their own store clicks"
ON store_clicks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view anonymized analytics data only
CREATE POLICY "Admins can view anonymized store click analytics"
ON store_clicks
FOR SELECT
TO authenticated
USING (
  is_admin_user() AND 
  -- Additional security: admins should use analytics functions, not direct access
  current_setting('role', true) = 'service_role'
);

-- 5. Create a secure analytics function for admins
-- This provides aggregated data without exposing individual user locations
CREATE OR REPLACE FUNCTION public.get_store_click_analytics(
  store_id_filter UUID DEFAULT NULL,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  store_id UUID,
  click_count BIGINT,
  unique_users BIGINT,
  avg_distance_km NUMERIC,
  most_common_region TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 6. Update existing click data to reduce precision
UPDATE store_clicks 
SET 
  user_latitude = ROUND(user_latitude, 3),
  user_longitude = ROUND(user_longitude, 3)
WHERE 
  user_latitude IS NOT NULL 
  AND user_longitude IS NOT NULL;

-- 7. Add constraint to ensure future data is properly truncated
ALTER TABLE store_clicks 
ADD CONSTRAINT check_coordinate_precision 
CHECK (
  ROUND(user_latitude, 3) = user_latitude AND 
  ROUND(user_longitude, 3) = user_longitude
);