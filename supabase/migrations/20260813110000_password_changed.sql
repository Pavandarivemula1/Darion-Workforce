-- 1. Add password_changed column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password_changed BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Update existing admin profiles to have password_changed = TRUE (so they aren't blocked)
UPDATE public.profiles
SET password_changed = TRUE
WHERE role = 'admin';

-- 3. Update the handle_new_user trigger to populate password_changed from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, password_changed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate'),
    COALESCE((NEW.raw_user_meta_data->>'password_changed')::BOOLEAN, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
