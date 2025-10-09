-- Fix Security Issues

-- 1. Remove email from profiles table (already stored in auth.users - no need to duplicate sensitive data)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- 2. Improve newsletter_subscribers security to prevent email enumeration
-- Add a function to safely handle newsletter subscriptions without leaking information
CREATE OR REPLACE FUNCTION public.safe_newsletter_subscribe(subscriber_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format
  IF subscriber_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Thank you for subscribing!');
  END IF;
  
  -- Validate email length
  IF length(subscriber_email) > 255 OR length(subscriber_email) < 5 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Thank you for subscribing!');
  END IF;
  
  -- Try to insert, but always return the same message to prevent enumeration
  BEGIN
    INSERT INTO public.newsletter_subscribers (email, source)
    VALUES (lower(trim(subscriber_email)), 'website')
    ON CONFLICT (email) DO NOTHING;
    
    -- Always return success message regardless of whether insert happened
    RETURN jsonb_build_object('success', true, 'message', 'Thank you for subscribing!');
  EXCEPTION WHEN OTHERS THEN
    -- Even on error, return generic success message to prevent enumeration
    RETURN jsonb_build_object('success', true, 'message', 'Thank you for subscribing!');
  END;
END;
$$;

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'newsletter_subscribers_email_key'
  ) THEN
    ALTER TABLE public.newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);
  END IF;
END $$;

-- Grant execute permission on the function to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.safe_newsletter_subscribe(text) TO authenticated, anon;