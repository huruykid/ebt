
-- Create enum for contribution types
CREATE TYPE public.contribution_type AS ENUM (
  'store_hours',
  'store_photo',
  'store_review',
  'store_tag',
  'contact_info',
  'report_incorrect_info',
  'verify_info'
);

-- Create enum for badge types
CREATE TYPE public.badge_type AS ENUM (
  'neighborhood_scout',
  'snap_hero',
  'photo_contributor',
  'reviewer',
  'info_verifier',
  'community_helper'
);

-- Create user_points table to track all point-earning activities
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_id BIGINT REFERENCES public.snap_stores(id) ON DELETE CASCADE,
  contribution_type contribution_type NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified BOOLEAN DEFAULT false
);

-- Create badges table to define available badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_type badge_type UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- lucide icon name
  points_required INTEGER,
  contributions_required INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_badges table to track earned badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_points
CREATE POLICY "Users can view all points activities" 
  ON public.user_points 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own points" 
  ON public.user_points 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for badges (public read-only)
CREATE POLICY "Anyone can view badges" 
  ON public.badges 
  FOR SELECT 
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view all earned badges" 
  ON public.user_badges 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can earn badges" 
  ON public.user_badges 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Insert initial badges
INSERT INTO public.badges (badge_type, name, description, icon, contributions_required) VALUES
('neighborhood_scout', 'Neighborhood Scout', 'Made 10 helpful contributions to stores', 'map-pin', 10),
('snap_hero', 'SNAP Hero', 'Verified champion with 100+ contributions', 'shield-check', 100),
('photo_contributor', 'Photo Contributor', 'Added 25 store photos', 'camera', 25),
('reviewer', 'Community Reviewer', 'Left 50 helpful reviews', 'star', 50),
('info_verifier', 'Info Verifier', 'Verified 30 store details', 'check-circle', 30),
('community_helper', 'Community Helper', 'Helped improve 5 stores', 'heart', 5);

-- Create view for user stats
CREATE VIEW public.user_stats AS
SELECT 
  user_id,
  COUNT(*) as total_contributions,
  SUM(points_earned) as total_points,
  COUNT(DISTINCT store_id) as stores_contributed_to,
  COUNT(CASE WHEN contribution_type = 'store_review' THEN 1 END) as reviews_count,
  COUNT(CASE WHEN contribution_type = 'store_photo' THEN 1 END) as photos_count,
  COUNT(CASE WHEN contribution_type = 'store_hours' THEN 1 END) as hours_count,
  COUNT(CASE WHEN verified = true THEN 1 END) as verified_contributions
FROM public.user_points
GROUP BY user_id;

-- Create function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger to auto-award badges when points are added
CREATE OR REPLACE FUNCTION public.auto_award_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check and award badges for the user
  PERFORM public.check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_award_badges
  AFTER INSERT ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_award_badges();
