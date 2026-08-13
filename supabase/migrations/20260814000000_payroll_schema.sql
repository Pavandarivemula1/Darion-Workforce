-- ============================================================================
-- DARION WORKFORCE PAYROLL & PAYMENTS SCHEMA
-- ============================================================================

-- 1. Add payment tracking columns to public.attendance
ALTER TABLE public.attendance 
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid' 
  CHECK (payment_status IN ('unpaid', 'paid', 'processing', 'on_hold'));

ALTER TABLE public.attendance 
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ NULL;

ALTER TABLE public.attendance 
  ADD COLUMN IF NOT EXISTS payment_reference TEXT NULL;

ALTER TABLE public.attendance 
  ADD COLUMN IF NOT EXISTS payment_method TEXT NULL;

ALTER TABLE public.attendance 
  ADD COLUMN IF NOT EXISTS payment_notes TEXT NULL;

-- 2. Add banking and payout destination columns to public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bank_name TEXT NULL;

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT NULL;

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bank_ifsc TEXT NULL;

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS upi_id TEXT NULL;

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS pan_number TEXT NULL;

-- 3. Create Payroll Settlements Table
CREATE TABLE IF NOT EXISTS public.payroll_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NULL,
  period_end TIMESTAMPTZ NULL,
  shift_count INT NOT NULL DEFAULT 0,
  total_hours NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  base_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  bonus_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  deduction_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  net_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'Bank Transfer',
  payment_reference TEXT NULL,
  notes TEXT NULL,
  settled_by UUID REFERENCES public.profiles(id),
  settled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_payment_status
  ON public.attendance (payment_status);

CREATE INDEX IF NOT EXISTS idx_attendance_user_payment_status
  ON public.attendance (user_id, payment_status);

CREATE INDEX IF NOT EXISTS idx_payroll_settlements_user
  ON public.payroll_settlements (user_id, settled_at DESC);

CREATE INDEX IF NOT EXISTS idx_payroll_settlements_settled_at
  ON public.payroll_settlements (settled_at DESC);

-- 5. Enable Row Level Security (RLS) on Payroll Settlements
ALTER TABLE public.payroll_settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage all payroll settlements" ON public.payroll_settlements;
CREATE POLICY "Admins manage all payroll settlements"
  ON public.payroll_settlements FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Candidates view own payroll settlements" ON public.payroll_settlements;
CREATE POLICY "Candidates view own payroll settlements"
  ON public.payroll_settlements FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
