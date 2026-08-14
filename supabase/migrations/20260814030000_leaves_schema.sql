-- ============================================================================
-- DARION WORKFORCE LEAVE & TIME-OFF MANAGEMENT SCHEMA
-- ============================================================================

-- 1. Create Leaves Table
CREATE TABLE IF NOT EXISTS public.leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL DEFAULT 'casual', -- 'casual', 'sick', 'paid', 'unpaid', 'emergency'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL DEFAULT 1,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  admin_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add Quota Allowance Columns to Profiles Table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS casual_leaves_allowed INT DEFAULT 12,
  ADD COLUMN IF NOT EXISTS sick_leaves_allowed INT DEFAULT 6,
  ADD COLUMN IF NOT EXISTS paid_leaves_allowed INT DEFAULT 12;

-- 3. Trigger for updated_at
DROP TRIGGER IF EXISTS update_leaves_updated_at ON public.leaves;
CREATE TRIGGER update_leaves_updated_at
  BEFORE UPDATE ON public.leaves
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_leaves_user_id ON public.leaves (user_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leaves (status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON public.leaves (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leaves_created_at ON public.leaves (created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Candidates can view own leaves" ON public.leaves;
CREATE POLICY "Candidates can view own leaves"
  ON public.leaves FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Candidates can insert own leaves" ON public.leaves;
CREATE POLICY "Candidates can insert own leaves"
  ON public.leaves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can cancel own pending leaves" ON public.leaves;
CREATE POLICY "Candidates can cancel own pending leaves"
  ON public.leaves FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

DROP POLICY IF EXISTS "Admins manage all leaves" ON public.leaves;
CREATE POLICY "Admins manage all leaves"
  ON public.leaves FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
