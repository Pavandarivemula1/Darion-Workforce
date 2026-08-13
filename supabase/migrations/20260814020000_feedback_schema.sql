-- ============================================================================
-- DARION WORKFORCE FEEDBACK & SENTIMENT SCHEMA
-- ============================================================================

-- 1. Create Feedbacks Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general', -- 'shift_feedback', 'suggestion', 'bug', 'workplace', 'general'
  rating INT CHECK (rating >= 1 AND rating <= 5),
  mood TEXT, -- 'great', 'good', 'neutral', 'rough', 'bad'
  tags TEXT[] DEFAULT '{}', -- e.g. ['Smooth Shift', 'High Workload', 'Equipment Issue']
  title TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'in_review', 'resolved', 'dismissed'
  admin_notes TEXT,
  attendance_id UUID REFERENCES public.attendance(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trigger for updated_at
DROP TRIGGER IF EXISTS update_feedbacks_updated_at ON public.feedbacks;
CREATE TRIGGER update_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON public.feedbacks (user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_type ON public.feedbacks (type);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.feedbacks (status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_attendance_id ON public.feedbacks (attendance_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Candidates can view own feedback" ON public.feedbacks;
CREATE POLICY "Candidates can view own feedback"
  ON public.feedbacks FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Candidates can insert own feedback" ON public.feedbacks;
CREATE POLICY "Candidates can insert own feedback"
  ON public.feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can update all feedbacks"
  ON public.feedbacks FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can delete feedbacks"
  ON public.feedbacks FOR DELETE
  USING (public.is_admin(auth.uid()));
