-- ============================================================================
-- ADD OVERSHIFT REQUEST TYPE AND DROP UNIQUE CONSTRAINT
-- ============================================================================

-- 1. Add request_type column to overshift_requests
ALTER TABLE public.overshift_requests 
ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'now' CHECK (request_type IN ('now', 'later'));

-- 2. Drop the unique constraint so that candidates can request again if rejected
DROP INDEX IF EXISTS public.unique_overshift_per_user_date;

-- (Optional) If there is an actual unique constraint object created instead of just an index, try dropping it too
ALTER TABLE public.overshift_requests DROP CONSTRAINT IF EXISTS unique_overshift_per_user_date;
