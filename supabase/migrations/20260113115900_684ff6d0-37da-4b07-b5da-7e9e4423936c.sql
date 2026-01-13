-- Fix profiles table RLS policies: Remove conflicting policies, keep single clear policy per operation
-- Issue: Multiple conflicting SELECT policies and confusing blanket denial

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "Deny all anonymous access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can explicitly view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create clean, single policies for each operation
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- No DELETE policy - profiles should not be deletable directly (cascade from auth.users)

-- Fix newsletter_subscribers table RLS policies: Remove duplicate policies
-- Issue: Two identical admin-only policies

DROP POLICY IF EXISTS "Admins can manage all subscriber data" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Only admins can access newsletter_subscribers directly" ON newsletter_subscribers;

-- Create single clear admin-only policy
CREATE POLICY "Admins can manage subscribers"
ON newsletter_subscribers
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Add comment explaining the access pattern
COMMENT ON TABLE newsletter_subscribers IS 'Email subscriptions. Direct access: admin only via RLS. Public subscribe: use safe_newsletter_subscribe() function which bypasses RLS via SECURITY DEFINER.';