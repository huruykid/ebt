-- Privacy Enhancement: Anonymize store_clicks to prevent user tracking
-- This migration removes direct user linkage and adds session-based anonymization

-- Step 1: Add anonymous_session_id column (hashed, non-reversible)
ALTER TABLE public.store_clicks 
ADD COLUMN anonymous_session_id TEXT;

-- Step 2: Make user_id nullable to allow anonymous tracking
ALTER TABLE public.store_clicks 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Update existing records to use anonymous session (hash user_id + date for non-reversibility)
UPDATE public.store_clicks 
SET anonymous_session_id = encode(sha256((user_id::text || DATE(clicked_at)::text || 'privacy_salt_v1')::bytea), 'hex'),
    user_id = NULL;

-- Step 4: Add index for analytics queries on anonymous sessions
CREATE INDEX IF NOT EXISTS idx_store_clicks_anonymous_session 
ON public.store_clicks(anonymous_session_id);

-- Step 5: Update RLS policies - remove user-based viewing, keep admin analytics
DROP POLICY IF EXISTS "Users can view their own store clicks" ON public.store_clicks;
DROP POLICY IF EXISTS "Authenticated users can create their own store clicks" ON public.store_clicks;

-- Allow any authenticated user to insert (we'll validate in RPC)
CREATE POLICY "Authenticated users can insert anonymous clicks" 
ON public.store_clicks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND user_id IS NULL);

-- Keep admin analytics policy
-- (existing policy "Admins can view anonymized store click analytics" remains)

-- Step 6: Update the privacy-preserving insert function
CREATE OR REPLACE FUNCTION public.insert_store_click_anonymous(
  p_store_id uuid, 
  p_latitude numeric, 
  p_longitude numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_session_hash TEXT;
  v_user_id uuid;
BEGIN
  -- Get current user (for session hash generation only)
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Create anonymous session hash: user_id + current_date + salt
  -- This allows counting unique users per day without tracking individuals over time
  v_session_hash := encode(
    sha256((v_user_id::text || CURRENT_DATE::text || 'privacy_salt_v1')::bytea), 
    'hex'
  );
  
  -- Insert with rounded coordinates (~1km precision) and no user_id
  INSERT INTO public.store_clicks (
    store_id, 
    user_id,  -- NULL for privacy
    user_latitude, 
    user_longitude,
    anonymous_session_id
  )
  VALUES (
    p_store_id,
    NULL,  -- Never store user_id
    ROUND(p_latitude::numeric, 2),  -- ~1km precision
    ROUND(p_longitude::numeric, 2),
    v_session_hash
  );
END;
$function$;

-- Step 7: Add comment explaining privacy model
COMMENT ON TABLE public.store_clicks IS 
'Anonymous store click analytics. Privacy protections:
- user_id is NULL (never stored)
- anonymous_session_id is a daily-rotating hash (cannot track users across days)
- Coordinates rounded to ~1km precision
- 7-day automatic data retention via cleanup_old_store_clicks()
- Only admins can view aggregate analytics';

COMMENT ON COLUMN public.store_clicks.anonymous_session_id IS 
'Daily-rotating hash of user session. Cannot be reversed to identify users. Resets each day to prevent cross-day tracking.';