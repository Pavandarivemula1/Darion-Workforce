-- ==============================================================================
-- MIGRATION: 20260822000000_superadmin_suite_schema.sql
-- DESCRIPTION: SuperAdmin Suite - System Settings, Audit Logs, and Diagnostics
-- ==============================================================================

-- 1. SYSTEM SETTINGS TABLE (Key-Value / JSON Config Store)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default system settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
  (
    'maintenance_mode', 
    '{"enabled": false, "message": "System is undergoing scheduled maintenance. Timer punches are temporarily paused."}'::jsonb,
    'Global platform maintenance mode controls'
  ),
  (
    'system_announcement',
    '{"enabled": false, "type": "info", "title": "", "message": "", "expires_at": null}'::jsonb,
    'Global announcement banner displayed across all portals'
  ),
  (
    'security_policies',
    '{"enforce_mfa_for_management": false, "max_consecutive_shift_hours": 16, "auto_cutoff_grace_mins": 30}'::jsonb,
    'Global security policies and shift duration caps'
  )
ON CONFLICT (key) DO NOTHING;

-- 2. SYSTEM AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL DEFAULT 'System',
  actor_role TEXT NOT NULL DEFAULT 'system',
  action TEXT NOT NULL, -- e.g., 'ROLE_UPDATED', 'RATE_CHANGED', 'MAINTENANCE_TOGGLED', 'USER_DELETED', 'SHIFT_CUTOFF'
  target_id UUID,
  target_name TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND role = 'super_admin'
  );
$$;

-- RLS POLICIES FOR SYSTEM SETTINGS
DROP POLICY IF EXISTS "Public can view active announcements" ON public.system_settings;
CREATE POLICY "Public can view active announcements"
  ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Superadmin full access to system settings" ON public.system_settings;
CREATE POLICY "Superadmin full access to system settings"
  ON public.system_settings
  FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- RLS POLICIES FOR AUDIT LOGS
DROP POLICY IF EXISTS "Superadmin can read all audit logs" ON public.audit_logs;
CREATE POLICY "Superadmin can read all audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
