-- Fix the get_user_stats function with proper SQL syntax
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Use COALESCE to get current user if no target provided
  WITH resolved_user AS (
    SELECT COALESCE($1, auth.uid()) as uid
  ),
  -- Check permissions first
  permission_check AS (
    SELECT 
      r.uid,
      CASE 
        WHEN r.uid = auth.uid() THEN true
        WHEN public.is_admin_user() THEN true
        ELSE false
      END as has_permission
    FROM resolved_user r
  )
  SELECT 
    p.uid::uuid as user_id,
    COALESCE(sum(up.points_earned), 0::bigint) AS total_points,
    COALESCE(count(up.id), 0::bigint) AS total_contributions,
    COALESCE(count(CASE WHEN up.verified = true THEN 1 ELSE NULL END), 0::bigint) AS verified_contributions,
    COALESCE(count(CASE WHEN up.contribution_type = 'store_review'::contribution_type THEN 1 ELSE NULL END), 0::bigint) AS reviews_count,
    COALESCE(count(CASE WHEN up.contribution_type = 'store_photo'::contribution_type THEN 1 ELSE NULL END), 0::bigint) AS photos_count,
    COALESCE(count(CASE WHEN up.contribution_type = 'store_hours'::contribution_type THEN 1 ELSE NULL END), 0::bigint) AS hours_count,
    COALESCE(count(DISTINCT up.store_id), 0::bigint) AS stores_contributed_to
  FROM permission_check p
  LEFT JOIN user_points up ON up.user_id = p.uid AND p.has_permission = true
  WHERE p.has_permission = true
  GROUP BY p.uid;
$$;