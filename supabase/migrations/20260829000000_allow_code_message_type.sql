-- Allow 'code' in chat_messages message_type check constraint
ALTER TABLE IF EXISTS public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
ALTER TABLE IF EXISTS public.chat_messages ADD CONSTRAINT chat_messages_message_type_check CHECK (message_type IN ('text', 'meet_card', 'file', 'system', 'code'));
