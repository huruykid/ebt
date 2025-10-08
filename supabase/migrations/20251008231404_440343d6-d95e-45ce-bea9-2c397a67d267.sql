-- Drop the insecure user_stats view since it cannot have RLS and isn't being used
-- The application already uses the secure get_user_stats() function which has proper permission checks
DROP VIEW IF EXISTS public.user_stats CASCADE;

-- Add a comment to document why we're using the function instead
COMMENT ON FUNCTION public.get_user_stats IS 'Secure function to retrieve user statistics with built-in permission checks. Use this instead of direct table access.';