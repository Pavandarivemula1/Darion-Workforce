-- ============================================================================
-- DARION WORKFORCE SHIFT MANAGEMENT SCHEMA
-- ============================================================================

-- 1. Create Shifts Table
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  grace_period_mins INT NOT NULL DEFAULT 15,
  auto_logout_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_overnight BOOLEAN NOT NULL DEFAULT FALSE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trigger for updated_at
DROP TRIGGER IF EXISTS update_shifts_updated_at ON public.shifts;
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Add shift_id to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL;

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_shift_id
  ON public.profiles (shift_id);

CREATE INDEX IF NOT EXISTS idx_shifts_is_default
  ON public.shifts (is_default);

-- 5. Enable Row Level Security (RLS) on Shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view shifts" ON public.shifts;
CREATE POLICY "Anyone authenticated can view shifts"
  ON public.shifts FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage all shifts" ON public.shifts;
CREATE POLICY "Admins manage all shifts"
  ON public.shifts FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. Seed Default Shifts if empty
DO $$
DECLARE
  default_shift_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.shifts WHERE is_default = TRUE) THEN
    -- Insert Default General Shift (09:00 AM to 05:00 PM)
    INSERT INTO public.shifts (name, start_time, end_time, grace_period_mins, auto_logout_enabled, is_overnight, is_default)
    VALUES ('General Shift (9 AM - 5 PM)', '09:00:00', '17:00:00', 15, TRUE, FALSE, TRUE)
    RETURNING id INTO default_shift_id;

    -- Insert Morning Shift (07:00 AM to 03:00 PM)
    INSERT INTO public.shifts (name, start_time, end_time, grace_period_mins, auto_logout_enabled, is_overnight, is_default)
    VALUES ('Morning Shift (7 AM - 3 PM)', '07:00:00', '15:00:00', 15, TRUE, FALSE, FALSE);

    -- Insert Evening Shift (02:00 PM to 10:00 PM)
    INSERT INTO public.shifts (name, start_time, end_time, grace_period_mins, auto_logout_enabled, is_overnight, is_default)
    VALUES ('Evening Shift (2 PM - 10 PM)', '14:00:00', '22:00:00', 15, TRUE, FALSE, FALSE);

    -- Insert Night Shift (10:00 PM to 06:00 AM)
    INSERT INTO public.shifts (name, start_time, end_time, grace_period_mins, auto_logout_enabled, is_overnight, is_default)
    VALUES ('Night Shift (10 PM - 6 AM)', '22:00:00', '06:00:00', 15, TRUE, TRUE, FALSE);

    -- Automatically assign existing candidates to Default General Shift
    UPDATE public.profiles
    SET shift_id = default_shift_id
    WHERE role = 'candidate' AND shift_id IS NULL;
  END IF;
END $$;
