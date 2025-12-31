-- Migration: Add function to easily create admin users
-- This allows admins to be created after user signup via Dashboard

-- Function to promote existing user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN 'ERROR: User with email ' || user_email || ' not found. Please create user first in Supabase Dashboard.';
  END IF;

  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN 'SUCCESS: User ' || user_email || ' is now an admin!';
END;
$$;

-- Grant execute permission to authenticated users (so admins can promote others)
GRANT EXECUTE ON FUNCTION promote_to_admin(TEXT) TO authenticated;

-- Try to promote the default admin if they exist
DO $$
DECLARE
  result TEXT;
BEGIN
  result := promote_to_admin('ma.kuddus37@gmail.com');
  RAISE NOTICE '%', result;
END;
$$;

-- Comment explaining usage
COMMENT ON FUNCTION promote_to_admin IS 'Promotes an existing Supabase Auth user to admin role. Usage: SELECT promote_to_admin(''email@example.com'');';
