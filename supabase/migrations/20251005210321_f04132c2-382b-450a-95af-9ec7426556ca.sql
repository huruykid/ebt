-- Fix newsletter_subscribers security issue
-- Remove redundant SELECT policy and ensure proper RLS protection

-- First, ensure RLS is enabled
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop the redundant "Admins can view all subscribers" policy
-- The "Admins can manage subscribers" policy with ALL command already covers SELECT
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.newsletter_subscribers;

-- Verify the remaining policies are correct:
-- 1. "Admins can manage subscribers" - Already exists with ALL command and is_admin_user() check
-- 2. "Anyone can subscribe to newsletter" - Already exists for INSERT only
-- These two policies provide proper security:
-- - Only admins can read/update/delete subscriber data
-- - Anyone can sign up (INSERT), but cannot view or modify existing records