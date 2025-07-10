-- Force drop and recreate views to clear any SECURITY DEFINER flags
DROP VIEW IF EXISTS public.store_review_stats CASCADE;
DROP VIEW IF EXISTS public.user_stats CASCADE;

-- Recreate views with explicit SECURITY INVOKER (though this should be default)
CREATE VIEW public.store_review_stats 
WITH (security_invoker = true) AS
SELECT 
  r.store_id,
  AVG(r.rating) as average_rating,
  COUNT(r.id) as review_count
FROM public.reviews r
GROUP BY r.store_id;

CREATE VIEW public.user_stats 
WITH (security_invoker = true) AS
SELECT 
  up.user_id,
  COALESCE(SUM(up.points_earned), 0) as total_points,
  COUNT(up.id) as total_contributions,
  COUNT(CASE WHEN up.verified = true THEN 1 END) as verified_contributions,
  COUNT(CASE WHEN up.contribution_type = 'store_review' THEN 1 END) as reviews_count,
  COUNT(CASE WHEN up.contribution_type = 'store_photo' THEN 1 END) as photos_count,
  COUNT(CASE WHEN up.contribution_type = 'store_hours' THEN 1 END) as hours_count,
  COUNT(DISTINCT up.store_id) as stores_contributed_to
FROM public.user_points up
GROUP BY up.user_id;