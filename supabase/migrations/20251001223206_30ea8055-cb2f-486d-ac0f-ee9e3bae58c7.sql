-- Add explicit policy to deny anonymous access to profiles table
-- This ensures customer email addresses and personal information are protected

-- Create a restrictive policy that explicitly denies all anonymous access
CREATE POLICY "Deny all anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add a comment explaining the security measure
COMMENT ON POLICY "Deny all anonymous access to profiles" ON public.profiles IS 
'Explicitly denies all access to the profiles table for anonymous users to prevent unauthorized access to customer email addresses and personal information.';