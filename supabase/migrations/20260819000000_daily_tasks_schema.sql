-- ============================================================================
-- DARION WORKFORCE DAILY TASK REPORTING SCHEMA
-- ============================================================================

-- 1. Create daily_tasks Table
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES public.attendance(id) ON DELETE SET NULL,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  project_name TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  hours_spent NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
  proof_url TEXT,
  blocker_description TEXT,
  admin_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trigger for updated_at
DROP TRIGGER IF EXISTS update_daily_tasks_updated_at ON public.daily_tasks;
CREATE TRIGGER update_daily_tasks_updated_at
  BEFORE UPDATE ON public.daily_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks (user_id, task_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON public.daily_tasks (task_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON public.daily_tasks (status);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_project ON public.daily_tasks (project_name);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_attendance_id ON public.daily_tasks (attendance_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Candidates can view own daily tasks; Admins view all" ON public.daily_tasks;
CREATE POLICY "Candidates can view own daily tasks; Admins view all"
  ON public.daily_tasks FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Candidates can insert own daily tasks" ON public.daily_tasks;
CREATE POLICY "Candidates can insert own daily tasks"
  ON public.daily_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can update own daily tasks" ON public.daily_tasks;
CREATE POLICY "Candidates can update own daily tasks"
  ON public.daily_tasks FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Candidates can delete own daily tasks; Admins delete any" ON public.daily_tasks;
CREATE POLICY "Candidates can delete own daily tasks; Admins delete any"
  ON public.daily_tasks FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
