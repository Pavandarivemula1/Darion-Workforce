-- ============================================================================
-- CANDIDATE TIME TRACKING SYSTEM — MASTER DATABASE SCHEMA
-- ============================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'candidate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Security Definer Helper Function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id OR auth.uid() IS NULL OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));


-- 5. Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enforce at most 1 active work session per user (logout_time IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_attendance_per_user
  ON public.attendance (user_id)
  WHERE (logout_time IS NULL);

-- 7. Performance Index
CREATE INDEX IF NOT EXISTS idx_attendance_user_login
  ON public.attendance (user_id, login_time DESC);

-- 8. Enable Row Level Security (RLS) on Attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates view own attendance; Admins view all" ON public.attendance;
CREATE POLICY "Candidates view own attendance; Admins view all"
  ON public.attendance FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Candidates insert own attendance" ON public.attendance;
CREATE POLICY "Candidates insert own attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates update own active attendance" ON public.attendance;
CREATE POLICY "Candidates update own active attendance"
  ON public.attendance FOR UPDATE
  USING (auth.uid() = user_id AND logout_time IS NULL)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins delete attendance" ON public.attendance;
CREATE POLICY "Admins delete attendance"
  ON public.attendance FOR DELETE
  USING (public.is_admin(auth.uid()));
