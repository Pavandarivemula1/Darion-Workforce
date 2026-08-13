-- ============================================================================
-- CANDIDATE TIME TRACKING SYSTEM — OVERSHIFT SCHEMA UPDATE
-- ============================================================================

-- Create Overshift Requests Table
CREATE TABLE IF NOT EXISTS public.overshift_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to prevent multiple requests for the same day
CREATE UNIQUE INDEX IF NOT EXISTS unique_overshift_per_user_date
  ON public.overshift_requests (user_id, request_date);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_overshift_requests_updated_at ON public.overshift_requests;
CREATE TRIGGER update_overshift_requests_updated_at
  BEFORE UPDATE ON public.overshift_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.overshift_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Candidates view own overshifts; Admins view all" ON public.overshift_requests;
CREATE POLICY "Candidates view own overshifts; Admins view all"
  ON public.overshift_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Candidates insert own overshifts" ON public.overshift_requests;
CREATE POLICY "Candidates insert own overshifts"
  ON public.overshift_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins update overshifts" ON public.overshift_requests;
CREATE POLICY "Admins update overshifts"
  ON public.overshift_requests FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
