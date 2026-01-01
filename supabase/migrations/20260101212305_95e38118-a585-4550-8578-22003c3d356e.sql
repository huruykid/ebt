-- Drop gamification-related tables, functions, and enums

-- First drop dependent tables
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS user_points CASCADE;
DROP TABLE IF EXISTS badges CASCADE;

-- Drop functions that depend on these tables/enums
DROP FUNCTION IF EXISTS award_contribution_points(p_contribution_type contribution_type, p_description text, p_store_id bigint);
DROP FUNCTION IF EXISTS check_and_award_badges(p_user_id uuid);
DROP FUNCTION IF EXISTS get_user_stats(target_user_id uuid);

-- Drop enums (must be done after dropping dependent columns/functions)
DROP TYPE IF EXISTS badge_type CASCADE;
DROP TYPE IF EXISTS contribution_type CASCADE;