-- ============================================================================
-- AUTOMATED DAILY PAY COUNT CALCULATION TRIGGER & ENGINE
-- ============================================================================

-- Function to automatically calculate and add daily pay count whenever a shift completes
CREATE OR REPLACE FUNCTION public.calculate_shift_daily_pay()
RETURNS TRIGGER AS $$
DECLARE
  v_hourly_rate NUMERIC(10, 2);
  v_net_seconds NUMERIC;
  v_net_hours NUMERIC;
BEGIN
  -- Only execute if logout_time is provided
  IF NEW.logout_time IS NOT NULL THEN
    -- Fetch candidate's hourly rate from profiles
    SELECT COALESCE(hourly_rate, 0.00) INTO v_hourly_rate
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF v_hourly_rate IS NULL THEN
      v_hourly_rate := 0.00;
    END IF;

    -- Calculate net working seconds (gross duration minus break duration)
    v_net_seconds := EXTRACT(EPOCH FROM (NEW.logout_time - NEW.login_time)) - COALESCE(NEW.break_duration_seconds, 0);
    
    IF v_net_seconds < 0 THEN
      v_net_seconds := 0;
    END IF;

    v_net_hours := v_net_seconds / 3600.0;

    -- Automatically calculate payout_amount if not manually customized or already computed
    IF NEW.payout_amount IS NULL OR NEW.payout_amount = 0 THEN
      NEW.payout_amount := ROUND(v_net_hours * v_hourly_rate, 2);
    END IF;

    -- Ensure default payment_status is 'unpaid' if null
    IF NEW.payment_status IS NULL THEN
      NEW.payment_status := 'unpaid';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if present
DROP TRIGGER IF EXISTS trigger_auto_calculate_daily_pay ON public.attendance;

-- Create Before Insert / Update Trigger on Attendance
CREATE TRIGGER trigger_auto_calculate_daily_pay
  BEFORE INSERT OR UPDATE OF logout_time, break_duration_seconds, user_id
  ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_shift_daily_pay();

-- Backfill any existing completed shifts that have NULL or 0 payout_amount
UPDATE public.attendance a
SET payout_amount = ROUND(
  (GREATEST(0, EXTRACT(EPOCH FROM (a.logout_time - a.login_time)) - COALESCE(a.break_duration_seconds, 0)) / 3600.0) * COALESCE(p.hourly_rate, 0.00),
  2
),
payment_status = COALESCE(a.payment_status, 'unpaid')
FROM public.profiles p
WHERE a.user_id = p.id
  AND a.logout_time IS NOT NULL
  AND (a.payout_amount IS NULL OR a.payout_amount = 0);
