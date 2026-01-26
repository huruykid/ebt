-- Add public SELECT policy for reviews table
-- Reviews should be publicly viewable (the public_reviews view already excludes user_id for privacy)
CREATE POLICY "Anyone can view reviews" 
ON public.reviews 
FOR SELECT 
USING (true);