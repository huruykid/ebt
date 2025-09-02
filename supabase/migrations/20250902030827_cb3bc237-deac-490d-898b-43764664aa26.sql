-- Enable leaked password protection for enhanced security
-- This will help prevent users from using passwords that have been compromised in data breaches

-- First check if password strength validation is enabled
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.config 
      WHERE parameter = 'password_min_length'
    ) THEN 'Password validation already configured'
    ELSE 'Configuring password validation'
  END as status;

-- Note: Leaked password protection needs to be enabled in the Auth UI settings
-- This cannot be done via SQL migration, user needs to:
-- 1. Go to Authentication > Settings in Supabase Dashboard
-- 2. Enable "Leaked Password Protection" under Password Security section