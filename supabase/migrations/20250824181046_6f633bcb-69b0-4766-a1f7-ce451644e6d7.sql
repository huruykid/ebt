-- Create a security definer function to safely get user stats
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
  
  RETURN QUERY
  SELECT 
    up.user_id,
    COALESCE(sum(up.points_earned), 0::bigint) AS total_points,
    count(up.id) AS total_contributions,
    count(CASE WHEN up.verified = true THEN 1 ELSE NULL END) AS verified_contributions,
    count(CASE WHEN up.contribution_type = 'store_review'::contribution_type THEN 1 ELSE NULL END) AS reviews_count,
    count(CASE WHEN up.contribution_type = 'store_photo'::contribution_type THEN 1 ELSE NULL END) AS photos_count,
    count(CASE WHEN up.contribution_type = 'store_hours'::contribution_type THEN 1 ELSE NULL END) AS hours_count,
    count(DISTINCT up.store_id) AS stores_contributed_to
  FROM user_points up
  WHERE up.user_id = target_user_id
  GROUP BY up.user_id;
END;
$$;