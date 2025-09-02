-- Fix the views to ensure they don't have SECURITY DEFINER issues
-- Drop and recreate the views with explicit SECURITY INVOKER (default but making it explicit)

DROP VIEW IF EXISTS public.public_reviews;
DROP VIEW IF EXISTS public.store_review_stats_secure;

-- Create secure public reviews view (explicitly SECURITY INVOKER)
CREATE VIEW public.public_reviews 
WITH (security_invoker = true) AS
SELECT 
    id,
    store_id,
    rating,
    review_text,
    created_at,
    -- Generate consistent anonymous display name based on user_id hash
    'User ' || SUBSTRING(MD5(user_id::text), 1, 6) as anonymous_reviewer
FROM public.reviews;

-- Create secure stats view (explicitly SECURITY INVOKER)  
CREATE VIEW public.store_review_stats_secure
WITH (security_invoker = true) AS
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

-- Grant appropriate permissions
GRANT SELECT ON public.public_reviews TO anon, authenticated;
GRANT SELECT ON public.store_review_stats_secure TO anon, authenticated;