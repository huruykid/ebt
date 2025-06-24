
-- Enable Row Level Security on the tables that need it
ALTER TABLE public.store_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snap_stores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for store_clicks table
-- Allow users to insert their own clicks
CREATE POLICY "Users can create store clicks" 
  ON public.store_clicks 
  FOR INSERT 
  WITH CHECK (true); -- Allow all users to track clicks

-- Allow users to view store clicks (for analytics)
CREATE POLICY "Users can view store clicks" 
  ON public.store_clicks 
  FOR SELECT 
  USING (true); -- Allow public read access for trending data

-- Create RLS policies for favorites table (these should already exist based on migration)
-- But let's ensure they're there
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

CREATE POLICY "Users can view their own favorites" 
  ON public.favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
  ON public.favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.favorites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for snap_stores table
-- Allow public read access to stores (they should be publicly viewable)
CREATE POLICY "Public can view stores" 
  ON public.snap_stores 
  FOR SELECT 
  USING (true);

-- Fix the security definer views by creating proper functions
-- Drop and recreate the views with proper security context
DROP VIEW IF EXISTS public.store_review_stats;
DROP VIEW IF EXISTS public.user_stats;

-- Create security definer function for store review stats
CREATE OR REPLACE FUNCTION public.get_store_review_stats()
RETURNS TABLE (
  store_id bigint,
  average_rating numeric,
  review_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    r.store_id,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as review_count
  FROM public.reviews r
  GROUP BY r.store_id;
$$;

-- Create security definer function for user stats
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE (
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
STABLE
AS $$
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
$$;

-- Recreate the views using the security definer functions
CREATE VIEW public.store_review_stats AS
SELECT * FROM public.get_store_review_stats();

CREATE VIEW public.user_stats AS
SELECT * FROM public.get_user_stats();

-- Fix the check_and_award_badges function to use a more restrictive search path
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_contributions INTEGER;
  badge_record RECORD;
BEGIN
  -- Get user's total contributions
  SELECT total_contributions INTO user_contributions
  FROM public.user_stats
  WHERE user_id = p_user_id;
  
  -- Check each badge requirement
  FOR badge_record IN 
    SELECT * FROM public.badges 
    WHERE contributions_required <= COALESCE(user_contributions, 0)
  LOOP
    -- Award badge if not already earned
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (p_user_id, badge_record.id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
END;
$$;
