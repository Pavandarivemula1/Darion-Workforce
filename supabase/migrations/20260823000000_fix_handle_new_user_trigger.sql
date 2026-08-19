-- ============================================================================
-- FIX: BULLETPROOF ON_AUTH_USER_CREATED TRIGGER & ROLE CHECK CONSTRAINTS
-- ============================================================================

-- 1. Ensure all RBAC roles are allowed in profiles_role_check
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'hr_manager', 'supervisor', 'candidate', 'auditor'));

-- 2. Ensure default organization exists if multi-tenancy columns exist
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'darion-workforce' LIMIT 1;
    IF default_org_id IS NULL THEN
      INSERT INTO public.organizations (name, slug, is_active)
      VALUES ('Darion Workforce Solutions', 'darion-workforce', true)
      RETURNING id INTO default_org_id;
    END IF;
  END IF;
END $$;

-- 3. Replace handle_new_user() with bulletproof exception handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  def_org_id UUID := NULL;
  user_full_name TEXT;
  user_role TEXT;
  is_pwd_changed BOOLEAN := FALSE;
BEGIN
  -- Extract full_name with fallbacks
  user_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(COALESCE(NEW.email, 'User'), '@', 1),
    'User'
  );

  -- Extract role with fallback to 'candidate'
  user_role := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''),
    'candidate'
  );

  -- Validate role against known roles, fallback to 'candidate' if unexpected
  IF user_role NOT IN ('super_admin', 'admin', 'hr_manager', 'supervisor', 'candidate', 'auditor') THEN
    user_role := 'candidate';
  END IF;

  -- Extract password_changed
  IF (NEW.raw_user_meta_data->>'password_changed') IS NOT NULL THEN
    BEGIN
      is_pwd_changed := (NEW.raw_user_meta_data->>'password_changed')::BOOLEAN;
    EXCEPTION WHEN OTHERS THEN
      is_pwd_changed := FALSE;
    END;
  END IF;

  -- Find default organization if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    SELECT id INTO def_org_id FROM public.organizations LIMIT 1;
  END IF;

  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    password_changed,
    hourly_rate,
    organization_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_full_name,
    user_role,
    is_pwd_changed,
    0.00,
    def_org_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth user creation on profile sync errors
  RAISE WARNING 'handle_new_user error for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Re-attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
