-- ============================================================================
-- ENTERPRISE ROLE-BASED ACCESS CONTROL (RBAC) & DEPARTMENTS SCHEMA MIGRATION
-- ============================================================================

-- 1. Upgrade Profiles Table Role Constraint
-- Supported Roles: super_admin, admin, hr_manager, supervisor, candidate, auditor
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'hr_manager', 'supervisor', 'candidate', 'auditor'));

-- 2. Create Departments & Teams Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for departments updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Add department_id and supervisor_id to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Create Performance Indexes for RBAC lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_dept ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_supervisor ON public.profiles(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_departments_org ON public.departments(organization_id);

-- 5. Helper Functions for Granular Security Checks

-- A. Get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  u_role TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT role INTO u_role FROM public.profiles WHERE id = user_id;
  RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- B. Check if Admin or Super Admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  u_role TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT role INTO u_role FROM public.profiles WHERE id = user_id;
  RETURN (u_role IN ('admin', 'super_admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update original is_admin function to remain fully backwards-compatible
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_admin_or_super(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- C. Check if Management (Super Admin, Admin, HR Manager, Supervisor)
CREATE OR REPLACE FUNCTION public.is_management(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  u_role TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT role INTO u_role FROM public.profiles WHERE id = user_id;
  RETURN (u_role IN ('super_admin', 'admin', 'hr_manager', 'supervisor'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- D. Check if HR or Admin (Allowed to view/manage payroll and candidate details)
CREATE OR REPLACE FUNCTION public.is_hr(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  u_role TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT role INTO u_role FROM public.profiles WHERE id = user_id;
  RETURN (u_role IN ('super_admin', 'admin', 'hr_manager'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- E. Check if Supervisor can manage a specific target user
CREATE OR REPLACE FUNCTION public.can_manage_user(manager_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  mgr_role TEXT;
  target_sup UUID;
  target_dept UUID;
  mgr_dept UUID;
BEGIN
  IF manager_id IS NULL OR target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- User can always manage themselves for self-actions
  IF manager_id = target_user_id THEN
    RETURN TRUE;
  END IF;

  SELECT role, department_id INTO mgr_role, mgr_dept FROM public.profiles WHERE id = manager_id;
  
  -- Platform and Org Admins or HR Managers have full organizational management scope
  IF mgr_role IN ('super_admin', 'admin', 'hr_manager') THEN
    RETURN TRUE;
  END IF;

  -- Supervisors manage candidates reporting directly to them or within their department
  IF mgr_role = 'supervisor' THEN
    SELECT supervisor_id, department_id INTO target_sup, target_dept FROM public.profiles WHERE id = target_user_id;
    RETURN (target_sup = manager_id OR (target_dept IS NOT NULL AND target_dept = mgr_dept));
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Enable RLS and Configure Policies on Departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view departments in their organization" ON public.departments;
CREATE POLICY "Users can view departments in their organization"
  ON public.departments FOR SELECT
  USING (
    public.is_admin_or_super(auth.uid()) OR 
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
    organization_id IS NULL
  );

DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (public.is_admin_or_super(auth.uid()) OR public.is_hr(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()) OR public.is_hr(auth.uid()));

-- 7. Update Daily Tasks RLS for Supervisor evaluation
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_tasks') THEN
    ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Management can view and score tasks" ON public.daily_tasks;
    CREATE POLICY "Management can view and score tasks"
      ON public.daily_tasks FOR ALL
      USING (
        auth.uid() = user_id OR 
        public.can_manage_user(auth.uid(), user_id) OR
        public.is_admin_or_super(auth.uid())
      )
      WITH CHECK (
        auth.uid() = user_id OR 
        public.can_manage_user(auth.uid(), user_id) OR
        public.is_admin_or_super(auth.uid())
      );
  END IF;
END $$;

-- 8. Update Attendance RLS for Management & Supervisors
DROP POLICY IF EXISTS "Management can manage attendance" ON public.attendance;
CREATE POLICY "Management can manage attendance"
  ON public.attendance FOR ALL
  USING (
    auth.uid() = user_id OR
    public.can_manage_user(auth.uid(), user_id) OR
    public.is_admin_or_super(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR
    public.can_manage_user(auth.uid(), user_id) OR
    public.is_admin_or_super(auth.uid())
  );

-- 9. Update Leaves RLS for Supervisors and HR
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leaves') THEN
    ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Management can review leaves" ON public.leaves;
    CREATE POLICY "Management can review leaves"
      ON public.leaves FOR ALL
      USING (
        auth.uid() = user_id OR
        public.can_manage_user(auth.uid(), user_id) OR
        public.is_hr(auth.uid())
      )
      WITH CHECK (
        auth.uid() = user_id OR
        public.can_manage_user(auth.uid(), user_id) OR
        public.is_hr(auth.uid())
      );
  END IF;
END $$;
