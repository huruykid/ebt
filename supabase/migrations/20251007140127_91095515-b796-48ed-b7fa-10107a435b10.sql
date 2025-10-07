-- Drop insecure public views that bypass RLS
DROP VIEW IF EXISTS public.public_profiles;
DROP VIEW IF EXISTS public.google_places_public;
DROP VIEW IF EXISTS public.public_reviews;
DROP VIEW IF EXISTS public.store_review_stats;

-- Strengthen newsletter subscription policy with email validation
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe with valid email"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 255
  AND length(email) >= 5
);