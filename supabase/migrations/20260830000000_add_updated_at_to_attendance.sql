-- ============================================================================
-- Add updated_at Column to attendance Table & Ensure Trigger Functionality
-- ============================================================================

-- 1. Safely add updated_at column to attendance table if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attendance' 
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.attendance 
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- 2. Ensure handle_updated_at function exists and updates NEW.updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Re-create the trigger for attendance table cleanly
DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Reload PostgREST schema cache to ensure immediate recognition across all connections
NOTIFY pgrst, 'reload schema';
