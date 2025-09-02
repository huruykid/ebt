-- Create a secure view for public review display without exposing user IDs
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
    id,
    store_id,
    rating,
    review_text,
    created_at,
    -- Generate consistent anonymous display name based on user_id hash
    'User ' || SUBSTRING(MD5(user_id::text), 1, 6) as anonymous_reviewer,
    -- Don't expose the actual user_id
    NULL::uuid as user_id
FROM public.reviews;

-- Grant public access to the view
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Update RLS policies for reviews table to be more secure
-- Remove the overly permissive "Anyone can view reviews" policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Create new restrictive policies
-- Users can only view their own reviews
CREATE POLICY "Users can view their own reviews" 
ON public.reviews 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can view all reviews (for admin functions)
CREATE POLICY "Service role can view all reviews" 
ON public.reviews 
FOR SELECT 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create aggregate stats view for store ratings (without exposing individual user data)
CREATE OR REPLACE VIEW public.store_review_stats_secure AS
SELECT 
    store_id,
    ROUND(AVG(rating::numeric), 2) as average_rating,
    COUNT(*) as review_count,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count,
    MAX(created_at) as latest_review_date
FROM public.reviews
GROUP BY store_id;

-- Grant access to the secure stats view
GRANT SELECT ON public.store_review_stats_secure TO anon, authenticated;