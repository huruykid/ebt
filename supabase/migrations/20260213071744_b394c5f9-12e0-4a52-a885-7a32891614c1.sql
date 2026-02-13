-- Remove overly permissive public SELECT policy on reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Ensure users can still view their own reviews (may already exist, use IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can view own reviews'
  ) THEN
    CREATE POLICY "Users can view own reviews"
    ON public.reviews
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;