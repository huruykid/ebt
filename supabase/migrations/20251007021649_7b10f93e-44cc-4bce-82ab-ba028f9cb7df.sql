-- Update the trigger function to assign admin role to test@gmail.com
CREATE OR REPLACE FUNCTION public.assign_admin_to_specific_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user's email is the admin email
  IF NEW.email = 'test@gmail.com' THEN
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Grant admin role to the existing test@gmail.com user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'test@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;