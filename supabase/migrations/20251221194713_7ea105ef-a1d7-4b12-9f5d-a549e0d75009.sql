-- Create a secure server-side function to award points with validation
CREATE OR REPLACE FUNCTION public.award_contribution_points(
  p_contribution_type contribution_type,
  p_store_id bigint DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  contribution_type contribution_type,
  store_id bigint,
  points_earned integer,
  description text,
  verified boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_points integer;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Server-side point calculation - prevents client manipulation
  v_points := CASE p_contribution_type
    WHEN 'store_review' THEN 15
    WHEN 'store_photo' THEN 10
    WHEN 'store_hours' THEN 20
    WHEN 'store_tag' THEN 5
    WHEN 'contact_info' THEN 15
    WHEN 'report_incorrect_info' THEN 10
    WHEN 'verify_info' THEN 25
    ELSE 5
  END;
  
  -- Check for duplicate contributions within 1 hour (rate limiting)
  IF EXISTS(
    SELECT 1 FROM user_points up
    WHERE up.user_id = v_user_id 
    AND up.store_id = p_store_id 
    AND up.contribution_type = p_contribution_type
    AND up.created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    RAISE EXCEPTION 'Duplicate contribution detected. Please wait before contributing again.';
  END IF;
  
  -- Insert and return the new points record
  RETURN QUERY
  INSERT INTO user_points (
    user_id, 
    contribution_type, 
    store_id, 
    points_earned, 
    description, 
    verified
  ) VALUES (
    v_user_id, 
    p_contribution_type, 
    p_store_id, 
    v_points, 
    COALESCE(p_description, 'Earned ' || v_points || ' points for ' || replace(p_contribution_type::text, '_', ' ')), 
    true
  )
  RETURNING 
    user_points.id,
    user_points.user_id,
    user_points.contribution_type,
    user_points.store_id,
    user_points.points_earned,
    user_points.description,
    user_points.verified,
    user_points.created_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.award_contribution_points TO authenticated;

-- Revoke direct INSERT on user_points from authenticated users
-- They must use the RPC function instead
REVOKE INSERT ON user_points FROM authenticated;

-- Drop the old INSERT policy since we're using RPC now
DROP POLICY IF EXISTS "Users can insert their own points" ON user_points;