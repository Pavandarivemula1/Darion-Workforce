-- ============================================================================
-- CANDIDATE TIME TRACKING SYSTEM — MASTER DATABASE SCHEMA
-- ============================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'candidate')),
  hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure hourly_rate column exists if updating existing table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

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
  break_start_time TIMESTAMPTZ NULL,
  break_duration_seconds INT NOT NULL DEFAULT 0,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT NULL,
  payout_amount NUMERIC(10, 2) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure approval & payment columns exist if updating existing table
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS break_start_time TIMESTAMPTZ NULL;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS break_duration_seconds INT NOT NULL DEFAULT 0;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS payout_amount NUMERIC(10, 2) NULL;

-- 6. Enforce at most 1 active work session per user (logout_time IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_attendance_per_user
  ON public.attendance (user_id)
  WHERE (logout_time IS NULL);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_user_login
  ON public.attendance (user_id, login_time DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_login_time
  ON public.attendance (login_time DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

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

DROP POLICY IF EXISTS "Admins update attendance approval" ON public.attendance;
CREATE POLICY "Admins update attendance approval"
  ON public.attendance FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete attendance" ON public.attendance;
CREATE POLICY "Admins delete attendance"
  ON public.attendance FOR DELETE
  USING (public.is_admin(auth.uid()));
