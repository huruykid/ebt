-- Update store_comments RLS policy to allow automated seeding with null user_id
DROP POLICY IF EXISTS "Authenticated users can create their own comments" ON public.store_comments;

CREATE POLICY "Authenticated users can create their own comments" 
ON public.store_comments 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to create their own comments
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- Allow service role to create automated comments with null user_id
  (auth.jwt() ->> 'role' = 'service_role' AND user_id IS NULL)
);