-- ============================================================================
-- Migration: Auto-Cutoff Safety & Punctuality Badging
-- ============================================================================

-- 1. Add is_auto_cutoff column to public.attendance
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS is_auto_cutoff BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Performance Index for is_auto_cutoff
CREATE INDEX IF NOT EXISTS idx_attendance_is_auto_cutoff 
  ON public.attendance (is_auto_cutoff);

CREATE INDEX IF NOT EXISTS idx_attendance_user_auto_cutoff 
  ON public.attendance (user_id, is_auto_cutoff);
