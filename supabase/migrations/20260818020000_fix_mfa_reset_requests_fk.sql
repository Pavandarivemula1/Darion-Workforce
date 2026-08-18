-- ============================================================================
-- Migration: Add Profiles Foreign Key / Ensure MFA Reset Requests Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mfa_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mfa_reset_requests ENABLE ROW LEVEL SECURITY;

-- Candidates can insert their own requests
DROP POLICY IF EXISTS "Anyone can insert mfa reset request" ON public.mfa_reset_requests;
CREATE POLICY "Anyone can insert mfa reset request"
  ON public.mfa_reset_requests
  FOR INSERT
  WITH CHECK (true);

-- Admins can view and update all requests
DROP POLICY IF EXISTS "Admins can view mfa reset requests" ON public.mfa_reset_requests;
CREATE POLICY "Admins can view mfa reset requests"
  ON public.mfa_reset_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update mfa reset requests" ON public.mfa_reset_requests;
CREATE POLICY "Admins can update mfa reset requests"
  ON public.mfa_reset_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
