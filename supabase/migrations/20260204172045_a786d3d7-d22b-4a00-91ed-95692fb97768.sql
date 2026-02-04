-- =====================================================
-- GAMIFICATION & ENGAGEMENT SYSTEM
-- =====================================================

-- 1. User Points Table - stores total points per user
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Contribution History - tracks individual point-earning actions
CREATE TABLE public.contribution_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN (
    'store_review', 'store_photo', 'price_report', 'price_verification',
    'daily_visit', 'weekly_streak', 'first_contribution', 'helpful_vote'
  )),
  points_awarded INTEGER NOT NULL,
  reference_id UUID, -- ID of the related item (review, photo, etc.)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Badges Table - defines available badges
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji or icon name
  points_required INTEGER DEFAULT 0,
  contribution_type TEXT, -- specific type needed, NULL for any
  contribution_count INTEGER DEFAULT 0, -- how many contributions needed
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. User Badges - tracks which badges users have earned
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- 5. Store Follows - for following stores
CREATE TABLE public.store_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.snap_stores(id) ON DELETE CASCADE,
  notify_on_updates BOOLEAN DEFAULT true,
  notify_on_price_drops BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, store_id)
);

-- 6. User Notifications - stores all notifications
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'badge_earned', 'streak_milestone', 'price_drop', 'store_update',
    'helpful_vote', 'welcome', 'weekly_digest', 'points_earned'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_type TEXT, -- 'store', 'badge', 'price', etc.
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Helpful Votes - for voting on reviews
CREATE TABLE public.helpful_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_id)
);

-- 8. Price Alerts - for tracking price drop notifications
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.snap_stores(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  target_price NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  last_notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Notification Preferences
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_digest BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  price_alerts BOOLEAN DEFAULT true,
  store_updates BOOLEAN DEFAULT true,
  badge_notifications BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- User Points - users can only see their own
CREATE POLICY "Users can view their own points" ON public.user_points
  FOR SELECT USING (auth.uid() = user_id);

-- Contribution History - users can only see their own
CREATE POLICY "Users can view their own contributions" ON public.contribution_history
  FOR SELECT USING (auth.uid() = user_id);

-- Badges - everyone can view badges
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

-- User Badges - users see their own, public view for profiles
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Store Follows - users can manage their own
CREATE POLICY "Users can view their own follows" ON public.store_follows
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can follow stores" ON public.store_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unfollow stores" ON public.store_follows
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update follow preferences" ON public.store_follows
  FOR UPDATE USING (auth.uid() = user_id);

-- Notifications - users see only their own
CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark notifications read" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Helpful Votes - users can manage their own
CREATE POLICY "Users can view their own votes" ON public.helpful_votes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add votes" ON public.helpful_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change votes" ON public.helpful_votes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove votes" ON public.helpful_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Price Alerts - users can manage their own
CREATE POLICY "Users can view their own alerts" ON public.price_alerts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create alerts" ON public.price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update alerts" ON public.price_alerts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete alerts" ON public.price_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Notification Preferences - users can manage their own
CREATE POLICY "Users can view their own preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_contribution_history_user ON public.contribution_history(user_id);
CREATE INDEX idx_contribution_history_type ON public.contribution_history(contribution_type);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_store_follows_user ON public.store_follows(user_id);
CREATE INDEX idx_store_follows_store ON public.store_follows(store_id);
CREATE INDEX idx_user_notifications_user ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_unread ON public.user_notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_helpful_votes_review ON public.helpful_votes(review_id);
CREATE INDEX idx_price_alerts_user ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_active ON public.price_alerts(store_id) WHERE is_active = true;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to award contribution points (SECURITY DEFINER for server-side only)
CREATE OR REPLACE FUNCTION public.award_contribution_points(
  p_user_id UUID,
  p_contribution_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_points INTEGER;
  v_last_contribution TIMESTAMP WITH TIME ZONE;
  v_today DATE := CURRENT_DATE;
  v_current_streak INTEGER;
  v_last_activity DATE;
BEGIN
  -- Determine points based on contribution type
  v_points := CASE p_contribution_type
    WHEN 'store_review' THEN 15
    WHEN 'store_photo' THEN 10
    WHEN 'price_report' THEN 5
    WHEN 'price_verification' THEN 2
    WHEN 'daily_visit' THEN 1
    WHEN 'weekly_streak' THEN 25
    WHEN 'first_contribution' THEN 50
    WHEN 'helpful_vote' THEN 3
    ELSE 0
  END;

  -- Check for duplicate contribution within 1 hour (prevent spam)
  SELECT created_at INTO v_last_contribution
  FROM contribution_history
  WHERE user_id = p_user_id
    AND contribution_type = p_contribution_type
    AND reference_id = p_reference_id
    AND created_at > now() - INTERVAL '1 hour'
  LIMIT 1;

  IF v_last_contribution IS NOT NULL THEN
    RETURN 0; -- Already awarded
  END IF;

  -- Record the contribution
  INSERT INTO contribution_history (user_id, contribution_type, points_awarded, reference_id, metadata)
  VALUES (p_user_id, p_contribution_type, v_points, p_reference_id, p_metadata);

  -- Get current streak info
  SELECT current_streak, last_activity_date
  INTO v_current_streak, v_last_activity
  FROM user_points
  WHERE user_id = p_user_id;

  -- Update or insert user points
  INSERT INTO user_points (user_id, total_points, lifetime_points, current_streak, last_activity_date)
  VALUES (p_user_id, v_points, v_points, 1, v_today)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + v_points,
    lifetime_points = user_points.lifetime_points + v_points,
    current_streak = CASE
      WHEN user_points.last_activity_date = v_today THEN user_points.current_streak
      WHEN user_points.last_activity_date = v_today - 1 THEN user_points.current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_points.longest_streak,
      CASE
        WHEN user_points.last_activity_date = v_today - 1 THEN user_points.current_streak + 1
        ELSE user_points.current_streak
      END
    ),
    last_activity_date = v_today,
    updated_at = now();

  RETURN v_points;
END;
$$;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE(badge_slug TEXT, badge_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
  v_user_stats RECORD;
  v_contribution_count INTEGER;
BEGIN
  -- Get user stats
  SELECT total_points, current_streak, longest_streak
  INTO v_user_stats
  FROM user_points
  WHERE user_id = p_user_id;

  -- Loop through all badges user doesn't have
  FOR v_badge IN
    SELECT b.*
    FROM badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM user_badges ub
      WHERE ub.badge_id = b.id AND ub.user_id = p_user_id
    )
  LOOP
    -- Check if badge should be awarded
    IF v_badge.points_required > 0 AND v_user_stats.total_points >= v_badge.points_required THEN
      -- Points-based badge
      INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
      badge_slug := v_badge.slug;
      badge_name := v_badge.name;
      RETURN NEXT;
    ELSIF v_badge.contribution_type IS NOT NULL AND v_badge.contribution_count > 0 THEN
      -- Contribution-based badge
      SELECT COUNT(*) INTO v_contribution_count
      FROM contribution_history
      WHERE user_id = p_user_id AND contribution_type = v_badge.contribution_type;
      
      IF v_contribution_count >= v_badge.contribution_count THEN
        INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        badge_slug := v_badge.slug;
        badge_name := v_badge.name;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Function to get helpful vote counts for reviews
CREATE OR REPLACE FUNCTION public.get_review_helpful_counts(p_review_ids UUID[])
RETURNS TABLE(review_id UUID, helpful_count BIGINT, not_helpful_count BIGINT)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    hv.review_id,
    COUNT(*) FILTER (WHERE hv.is_helpful = true) as helpful_count,
    COUNT(*) FILTER (WHERE hv.is_helpful = false) as not_helpful_count
  FROM helpful_votes hv
  WHERE hv.review_id = ANY(p_review_ids)
  GROUP BY hv.review_id;
$$;

-- =====================================================
-- SEED BADGES
-- =====================================================

INSERT INTO public.badges (slug, name, description, icon, points_required, contribution_type, contribution_count) VALUES
-- Points-based badges
('newcomer', 'Newcomer', 'Welcome to the community!', '👋', 0, NULL, 0),
('contributor', 'Contributor', 'Earned 50 points', '⭐', 50, NULL, 0),
('expert', 'Expert', 'Earned 200 points', '🌟', 200, NULL, 0),
('superstar', 'Superstar', 'Earned 500 points', '💫', 500, NULL, 0),
('legend', 'Legend', 'Earned 1000 points', '👑', 1000, NULL, 0),

-- Contribution-based badges
('first_review', 'First Review', 'Left your first store review', '📝', 0, 'store_review', 1),
('reviewer', 'Reviewer', 'Left 5 store reviews', '✍️', 0, 'store_review', 5),
('critic', 'Critic', 'Left 25 store reviews', '🎭', 0, 'store_review', 25),
('first_photo', 'Photographer', 'Uploaded your first store photo', '📸', 0, 'store_photo', 1),
('shutterbug', 'Shutterbug', 'Uploaded 10 store photos', '🖼️', 0, 'store_photo', 10),
('first_price', 'Price Spotter', 'Reported your first price', '💰', 0, 'price_report', 1),
('price_hunter', 'Price Hunter', 'Reported 20 prices', '🔍', 0, 'price_report', 20),

-- Streak badges
('streak_3', 'On Fire', '3-day activity streak', '🔥', 0, NULL, 0),
('streak_7', 'Week Warrior', '7-day activity streak', '⚡', 0, NULL, 0),
('streak_30', 'Monthly Champion', '30-day activity streak', '🏆', 0, NULL, 0);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to auto-check badges after points update
CREATE OR REPLACE FUNCTION public.trigger_check_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_points_update
  AFTER INSERT OR UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_badges();

-- Trigger to update timestamps
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();