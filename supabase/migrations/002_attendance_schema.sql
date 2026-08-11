-- ============================================================================
-- Phase 2 Migration: Attendance Table & Security Policies
-- ============================================================================

-- 1. Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Database-level constraint: Enforce at most 1 active session per user
-- Active session is defined as logout_time IS NULL
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_attendance_per_user
  ON public.attendance (user_id)
  WHERE (logout_time IS NULL);

-- 3. Performance Index for history queries sorted by login_time
CREATE INDEX IF NOT EXISTS idx_attendance_user_login
  ON public.attendance (user_id, login_time DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for attendance

-- SELECT Policy: Candidate reads own attendance; Admin reads all attendance
CREATE POLICY "Candidates view own attendance; Admins view all"
  ON public.attendance
  FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

-- INSERT Policy: Candidate can only create an attendance record for themselves
CREATE POLICY "Candidates insert own attendance"
  ON public.attendance
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- UPDATE Policy: Candidate can only update their ACTIVE attendance record (logout_time IS NULL)
CREATE POLICY "Candidates update own active attendance"
  ON public.attendance
  FOR UPDATE
  USING (
    auth.uid() = user_id AND logout_time IS NULL
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- DELETE Policy: Admin can delete attendance records if necessary (Candidate cannot)
CREATE POLICY "Admins delete attendance"
  ON public.attendance
  FOR DELETE
  USING (
    public.is_admin(auth.uid())
  );
