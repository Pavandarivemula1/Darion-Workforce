-- Meet System Schema Migration
-- Creates meet_rooms, meet_participants, meet_recordings, meet_messages

-- 1. Create meet_rooms table
CREATE TABLE IF NOT EXISTS public.meet_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Quick Meeting',
  description TEXT,
  host_id UUID,
  host_name TEXT NOT NULL DEFAULT 'Host',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  waiting_room_enabled BOOLEAN NOT NULL DEFAULT false,
  allow_screen_share BOOLEAN NOT NULL DEFAULT true,
  allow_chat BOOLEAN NOT NULL DEFAULT true,
  allow_unmute BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('scheduled', 'active', 'ended')),
  scheduled_start_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create meet_participants table
CREATE TABLE IF NOT EXISTS public.meet_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.meet_rooms(id) ON DELETE CASCADE,
  user_id UUID,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'participant' CHECK (user_role IN ('host', 'co-host', 'participant')),
  status TEXT NOT NULL DEFAULT 'admitted' CHECK (status IN ('waiting', 'admitted', 'rejected', 'left', 'kicked')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ
);

-- 3. Create meet_recordings table
CREATE TABLE IF NOT EXISTS public.meet_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.meet_rooms(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,
  recorded_by_name TEXT NOT NULL DEFAULT 'Host',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create meet_messages table
CREATE TABLE IF NOT EXISTS public.meet_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.meet_rooms(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'participant',
  message TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  is_private BOOLEAN DEFAULT false,
  recipient_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meet_rooms_code ON public.meet_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_meet_rooms_status ON public.meet_rooms(status);
CREATE INDEX IF NOT EXISTS idx_meet_participants_room ON public.meet_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_meet_recordings_room ON public.meet_recordings(room_id);
CREATE INDEX IF NOT EXISTS idx_meet_messages_room ON public.meet_messages(room_id);

-- Enable RLS on all tables
ALTER TABLE public.meet_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_messages ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies for authenticated users and public meeting room access
CREATE POLICY "Allow public read access to meet_rooms"
  ON public.meet_rooms FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access to meet_rooms"
  ON public.meet_rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update access to meet_rooms"
  ON public.meet_rooms FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete access to meet_rooms"
  ON public.meet_rooms FOR DELETE
  USING (true);

-- meet_participants policies
CREATE POLICY "Allow all access to meet_participants"
  ON public.meet_participants FOR ALL
  USING (true)
  WITH CHECK (true);

-- meet_recordings policies
CREATE POLICY "Allow all access to meet_recordings"
  ON public.meet_recordings FOR ALL
  USING (true)
  WITH CHECK (true);

-- meet_messages policies
CREATE POLICY "Allow all access to meet_messages"
  ON public.meet_messages FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('meet-recordings', 'meet-recordings', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('meet-files', 'meet-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for meet-recordings and meet-files
CREATE POLICY "Public Access for meet-recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meet-recordings');

CREATE POLICY "Allow uploads to meet-recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meet-recordings');

CREATE POLICY "Public Access for meet-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meet-files');

CREATE POLICY "Allow uploads to meet-files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meet-files');
