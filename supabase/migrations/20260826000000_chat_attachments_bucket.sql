-- Ensure chat-attachments bucket exists with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Public Access for chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to chat-attachments" ON storage.objects;

-- Create public read policy
CREATE POLICY "Public Access for chat-attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-attachments');

-- Create insert policy for authenticated users
CREATE POLICY "Allow uploads to chat-attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-attachments');

-- Create update policy
CREATE POLICY "Allow updates to chat-attachments"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'chat-attachments');
