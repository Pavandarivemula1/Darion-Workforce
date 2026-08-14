-- Add is_beta_tester column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT false;
