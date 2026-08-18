-- ============================================================================
-- Migration: Admin Attendance Management (Timer Controls & Manual Time Entries)
-- ============================================================================

-- 1. Add admin_notes column to public.attendance if not already present
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS admin_notes TEXT NULL;

-- 2. Performance Index for active sessions lookup
CREATE INDEX IF NOT EXISTS idx_attendance_active_sessions 
  ON public.attendance (user_id, login_time DESC) 
  WHERE (logout_time IS NULL);

-- 3. RLS: Ensure Admins have full INSERT privileges for all candidates
DROP POLICY IF EXISTS "Admins insert attendance" ON public.attendance;
CREATE POLICY "Admins insert attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. RLS: Ensure Admins have full UPDATE privileges on all columns of attendance
DROP POLICY IF EXISTS "Admins update attendance approval" ON public.attendance;
DROP POLICY IF EXISTS "Admins update attendance" ON public.attendance;
CREATE POLICY "Admins update attendance"
  ON public.attendance FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. RLS: Ensure Admins have full DELETE privileges
DROP POLICY IF EXISTS "Admins delete attendance" ON public.attendance;
CREATE POLICY "Admins delete attendance"
  ON public.attendance FOR DELETE
  USING (public.is_admin(auth.uid()));
