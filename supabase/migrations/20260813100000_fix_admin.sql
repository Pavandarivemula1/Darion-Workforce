-- Fix the admin role for pavan@darion.in

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find the user
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'pavan@darion.in'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Update the raw_user_meta_data to have lowercase 'admin'
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"')
    WHERE id = v_user_id;

    -- Insert or update the profile
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (v_user_id, 'Pavan Darivemula', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END $$;
