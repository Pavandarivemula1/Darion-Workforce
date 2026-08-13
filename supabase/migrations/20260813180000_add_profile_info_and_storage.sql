-- 1. Add new columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_number TEXT;

-- 2. Create 'avatars' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies
-- Allow public access to view avatars
DROP POLICY IF EXISTS "Public View Avatars" ON storage.objects;
CREATE POLICY "Public View Avatars"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Allow admins to insert/update/delete avatars
DROP POLICY IF EXISTS "Admin Manage Avatars" ON storage.objects;
CREATE POLICY "Admin Manage Avatars"
  ON storage.objects FOR ALL
  USING ( bucket_id = 'avatars' AND public.is_admin(auth.uid()) )
  WITH CHECK ( bucket_id = 'avatars' AND public.is_admin(auth.uid()) );
