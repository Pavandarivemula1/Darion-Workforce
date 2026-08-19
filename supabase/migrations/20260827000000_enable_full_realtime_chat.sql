-- Ensure full replica identity on chat tables for reliable postgres_changes
ALTER TABLE IF EXISTS public.chat_conversations REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.chat_reactions REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.chat_participants REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.chat_user_presence REPLICA IDENTITY FULL;

-- Ensure all chat tables are published to supabase_realtime
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
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_user_presence;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
