-- ============================================================================
-- Phase 1 Migration: Profiles Table & Security Policies
-- ============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'candidate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Security Definer Helper Function to check if a user is an admin
-- Using SECURITY DEFINER prevents infinite recursion when checking RLS policies on profiles
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for profiles

-- Policy: Select profiles (Users can read their own profile, Admins can read all profiles)
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin(auth.uid())
  );

-- Policy: Insert profile (Users can insert their own profile upon registration, or via SQL Editor/Admin setup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR auth.uid() IS NULL OR public.is_admin(auth.uid())
  );

-- Policy: Update profiles (Users can update their own profile, Admins can update any profile)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = id OR public.is_admin(auth.uid())
  );

-- 6. Trigger to automatically handle profile creation when user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users (if permissions allow in Supabase dashboard)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DEMO SEED INSTRUCTIONS FOR SUPABASE SQL EDITOR:
-- ============================================================================
-- To seed test users (1 Admin, 2 Candidates), you can create them via Supabase Auth Dashboard
-- or execute the following snippet in Supabase SQL Editor if creating manually:
/*
-- 1 Admin
-- Email: admin@example.com (Password set via Supabase Dashboard Auth)
-- 2 Candidates
-- Email: candidate1@example.com
-- Email: candidate2@example.com
*/
