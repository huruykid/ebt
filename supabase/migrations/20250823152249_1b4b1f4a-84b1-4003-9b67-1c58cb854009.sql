-- Fix RLS policies for sensitive tables

-- 1. Fix store_clicks table - restrict to user's own clicks or admin access
DROP POLICY IF EXISTS "Users can view store clicks" ON store_clicks;
CREATE POLICY "Users can view their own store clicks" 
ON store_clicks 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Fix user_points table - restrict to user's own points
DROP POLICY IF EXISTS "Users can view all points activities" ON user_points;
CREATE POLICY "Users can view their own points activities" 
ON user_points 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Fix user_badges table - restrict to user's own badges  
DROP POLICY IF EXISTS "Users can view all earned badges" ON user_badges;
CREATE POLICY "Users can view their own earned badges" 
ON user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Create admin role check function for secure access
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user has admin role in profiles
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (profiles.full_name ILIKE '%admin%' OR profiles.username ILIKE '%admin%')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. Add admin access policies for store_clicks
CREATE POLICY "Admins can view all store clicks" 
ON store_clicks 
FOR SELECT 
USING (public.is_admin_user());

-- 6. Add admin access policies for user_points
CREATE POLICY "Admins can view all user points" 
ON user_points 
FOR SELECT 
USING (public.is_admin_user());

-- 7. Add admin access policies for user_badges  
CREATE POLICY "Admins can view all user badges" 
ON user_badges 
FOR SELECT 
USING (public.is_admin_user());

-- 8. Fix storage policies for store-photos bucket
-- Delete existing overly permissive policies
DELETE FROM storage.objects WHERE bucket_id = 'store-photos';

-- Create secure storage policies
CREATE POLICY "Authenticated users can upload store photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'store-photos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view store photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'store-photos');

CREATE POLICY "Users can update their own store photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'store-photos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own store photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'store-photos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);