-- Fix security definer views to use security invoker mode
-- This ensures views respect RLS policies of the querying user

-- Update store_review_stats_secure view
ALTER VIEW public.store_review_stats_secure SET (security_invoker = on);

-- Update public_reviews view (if it's a view)
ALTER VIEW public.public_reviews SET (security_invoker = on);

-- Update public_store_comments view (if it's a view)
ALTER VIEW public.public_store_comments SET (security_invoker = on);

-- Update reviews_public view (the privacy-protecting view I just created)
ALTER VIEW public.reviews_public SET (security_invoker = on);