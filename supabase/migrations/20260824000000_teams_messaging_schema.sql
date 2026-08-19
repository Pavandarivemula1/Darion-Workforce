-- ============================================================================
-- TEAMS-STYLE REAL-TIME MESSAGING & CHANNELS SCHEMA
-- ============================================================================

-- 1. Create chat_conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  type TEXT NOT NULL DEFAULT 'channel' CHECK (type IN ('direct', 'group', 'channel')),
  name TEXT,
  slug TEXT,
  description TEXT,
  avatar_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for chat_conversations updated_at
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Create chat_participants table
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- 3. Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE, -- For threaded replies
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'meet_card', 'file', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size_bytes BIGINT,
  file_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- e.g. for meet details: { roomId, roomCode, title, hostName, startedAt }
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for chat_messages updated_at
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function & Trigger to update conversation's last_message_at on new message
CREATE OR REPLACE FUNCTION public.handle_new_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_new_chat_message ON public.chat_messages;
CREATE TRIGGER trg_new_chat_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_chat_message();

-- 4. Create chat_reactions table
CREATE TABLE IF NOT EXISTS public.chat_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- 5. Create chat_user_presence table
CREATE TABLE IF NOT EXISTS public.chat_user_presence (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'in_meeting', 'busy', 'away', 'dnd', 'offline')),
  status_message TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_type ON public.chat_conversations(type);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_msg ON public.chat_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_conv ON public.chat_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent ON public.chat_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_chat_reactions_msg ON public.chat_reactions(message_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_user_presence ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
-- chat_conversations
DROP POLICY IF EXISTS "Public channels viewable by all authenticated users" ON public.chat_conversations;
CREATE POLICY "Public channels viewable by all authenticated users"
  ON public.chat_conversations FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      is_private = false OR
      public.is_admin(auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.chat_participants 
        WHERE conversation_id = chat_conversations.id AND user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.chat_conversations;
CREATE POLICY "Authenticated users can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins or Creators can update conversations" ON public.chat_conversations;
CREATE POLICY "Admins or Creators can update conversations"
  ON public.chat_conversations FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.chat_participants 
      WHERE conversation_id = chat_conversations.id AND user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- chat_participants
DROP POLICY IF EXISTS "Users can view participants in accessible conversations" ON public.chat_participants;
CREATE POLICY "Users can view participants in accessible conversations"
  ON public.chat_participants FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can join or be added to conversations" ON public.chat_participants;
CREATE POLICY "Users can join or be added to conversations"
  ON public.chat_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own participant settings" ON public.chat_participants;
CREATE POLICY "Users can update their own participant settings"
  ON public.chat_participants FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can leave conversations" ON public.chat_participants;
CREATE POLICY "Users can leave conversations"
  ON public.chat_participants FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- chat_messages
DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON public.chat_messages;
CREATE POLICY "Users can view messages in accessible conversations"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Senders can edit their own messages" ON public.chat_messages;
CREATE POLICY "Senders can edit their own messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = sender_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Senders or Admins can delete messages" ON public.chat_messages;
CREATE POLICY "Senders or Admins can delete messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = sender_id OR public.is_admin(auth.uid()));

-- chat_reactions
DROP POLICY IF EXISTS "Users can view reactions" ON public.chat_reactions;
CREATE POLICY "Users can view reactions"
  ON public.chat_reactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can add reactions" ON public.chat_reactions;
CREATE POLICY "Users can add reactions"
  ON public.chat_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their reactions" ON public.chat_reactions;
CREATE POLICY "Users can remove their reactions"
  ON public.chat_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- chat_user_presence
DROP POLICY IF EXISTS "Users can view presence" ON public.chat_user_presence;
CREATE POLICY "Users can view presence"
  ON public.chat_user_presence FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can upsert own presence" ON public.chat_user_presence;
CREATE POLICY "Users can upsert own presence"
  ON public.chat_user_presence FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Seed Default Channels
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.chat_conversations WHERE type = 'channel' AND slug = 'general') THEN
    INSERT INTO public.chat_conversations (type, name, slug, description, is_private)
    VALUES 
      ('channel', 'General', 'general', 'Organization-wide team discussions, general updates, and casual banter.', false),
      ('channel', 'Announcements', 'announcements', 'Official management announcements, policy notices, and company alerts.', false),
      ('channel', 'Shift Operations', 'shift-operations', 'Live shift handovers, daily coverage, and attendance queries.', false),
      ('channel', 'HR & Support', 'hr-support', 'Help desk for leave requests, payroll questions, and HR assistance.', false);
  END IF;
END $$;

-- 10. Enable Supabase Realtime Publication for Chat
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_user_presence;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
