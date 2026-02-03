-- Consolidate store_comments SELECT policies to ensure consistent privacy protection
-- The table has overlapping policies that create confusion about user_id visibility

-- Drop the redundant/confusing SELECT policies
DROP POLICY IF EXISTS "Users can view their own comments" ON public.store_comments;
DROP POLICY IF EXISTS "Users can view their own comments with user_id" ON public.store_comments;

-- Keep "Public can view anonymized comments" for general access via the public_store_comments view
-- Keep "Admins can view all comments with user_id" for admin management
-- The public_store_comments view already excludes user_id, so public access is safe

-- Add a comment explaining the policy structure
COMMENT ON TABLE public.store_comments IS 'Store comments table. Public access should use the public_store_comments view which excludes user_id. Direct table access exposes user_id only to admins and the comment author (for management purposes).';