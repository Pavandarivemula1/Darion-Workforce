-- Add Google Drive metadata fields to meet_recordings
ALTER TABLE public.meet_recordings 
ADD COLUMN IF NOT EXISTS google_drive_file_id TEXT,
ADD COLUMN IF NOT EXISTS google_drive_url TEXT,
ADD COLUMN IF NOT EXISTS google_drive_status TEXT DEFAULT 'pending';
