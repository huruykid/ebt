-- Fix the get_user_stats function to always return a row with default values
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  user_id uuid,
  total_points bigint,
  total_contributions bigint,
  verified_contributions bigint,
  reviews_count bigint,
  photos_count bigint,
  hours_count bigint,
  stores_contributed_to bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If no target_user_id provided, use current user
  IF target_user_id IS NULL THEN
    target_user_id := auth.uid();
  END IF;
  
  -- Check permissions: users can only see their own stats, admins can see all
  IF target_user_id != auth.uid() AND NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: You can only view your own statistics';
  END IF;
  
  -- Always return a row, even if user has no contributions
  RETURN QUERY
  SELECT 
    target_user_id as user_id,
    COALESCE(sum(up.points_earned), 0::bigint) AS total_points,
    COALESCE(count(up.id), 0::bigint) AS total_contributions,
    COALESCE(count(CASE WHEN up.verified = true THEN 1 ELSE NULL END), 0::bigint) AS verified_contributions,
    COALESCE(count(CASE WHEN up.contribution_type = 'store_review'::contribution_type THEN 1 ELSE NULL END), 0::bigint) AS reviews_count,
    COALESCE(count(CASE WHEN up.contribution_type = 'store_photo'::contribution_type THEN 1 ELSE NULL END), 0::bigint) AS photos_count,
    COALESCE(count(CASE WHEN up.contribution_type = 'store_hours'::contribution_type THEN 1 ELSE NULL END), 0::bigint) AS hours_count,
    COALESCE(count(DISTINCT up.store_id), 0::bigint) AS stores_contributed_to
  FROM user_points up
  WHERE up.user_id = target_user_id OR NOT EXISTS(SELECT 1 FROM user_points WHERE user_id = target_user_id)
  GROUP BY target_user_id
  HAVING target_user_id IS NOT NULL;