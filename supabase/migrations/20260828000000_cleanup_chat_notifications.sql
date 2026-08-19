-- Cleanup any legacy chat messages from the persistent notifications table
DELETE FROM public.notifications WHERE type = 'chat_message';
