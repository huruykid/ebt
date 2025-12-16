-- Update the cleanup function to use 30 days instead of 90
CREATE OR REPLACE FUNCTION public.cleanup_old_store_clicks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.store_clicks
  WHERE clicked_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Also truncate coordinates to reduce precision for privacy (city-level ~0.01 degrees)
-- This function will be used when inserting new clicks
CREATE OR REPLACE FUNCTION public.insert_store_click_with_privacy(
  p_store_id uuid,
  p_user_id uuid,
  p_latitude numeric,
  p_longitude numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.store_clicks (store_id, user_id, user_latitude, user_longitude)
  VALUES (
    p_store_id,
    p_user_id,
    ROUND(p_latitude::numeric, 2),  -- ~1km precision instead of exact location
    ROUND(p_longitude::numeric, 2)
  );
END;
$$;