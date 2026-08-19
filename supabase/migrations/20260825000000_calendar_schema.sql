-- ============================================================================
-- UNIFIED ENTERPRISE WORKFORCE CALENDAR SCHEMA
-- ============================================================================

-- 1. Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'company_event' CHECK (event_type IN ('meeting', 'shift', 'leave', 'task_deadline', 'company_event', 'training', 'review')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  meet_room_id UUID REFERENCES public.meet_rooms(id) ON DELETE SET NULL,
  meet_url TEXT,
  color_tag TEXT DEFAULT '#3B82F6', -- Default Hex color
  recurrence_rule TEXT DEFAULT 'none', -- 'none', 'daily', 'weekly', 'monthly'
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'team', 'private')),
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for calendar_events updated_at
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Create calendar_event_attendees table
CREATE TABLE IF NOT EXISTS public.calendar_event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
  response_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_range ON public.calendar_events (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_organizer ON public.calendar_events (organizer_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events (event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_attendees_user ON public.calendar_event_attendees (user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_attendees_event ON public.calendar_event_attendees (event_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_attendees ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for calendar_events
DROP POLICY IF EXISTS "Users can view accessible calendar events" ON public.calendar_events;
CREATE POLICY "Users can view accessible calendar events"
  ON public.calendar_events FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      visibility = 'public' OR
      organizer_id = auth.uid() OR
      public.is_admin(auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.calendar_event_attendees 
        WHERE event_id = calendar_events.id AND user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create calendar events" ON public.calendar_events;
CREATE POLICY "Authenticated users can create calendar events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Organizers or Admins can update calendar events" ON public.calendar_events;
CREATE POLICY "Organizers or Admins can update calendar events"
  ON public.calendar_events FOR UPDATE
  USING (organizer_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Organizers or Admins can delete calendar events" ON public.calendar_events;
CREATE POLICY "Organizers or Admins can delete calendar events"
  ON public.calendar_events FOR DELETE
  USING (organizer_id = auth.uid() OR public.is_admin(auth.uid()));

-- 6. RLS Policies for calendar_event_attendees
DROP POLICY IF EXISTS "Users can view event attendees" ON public.calendar_event_attendees;
CREATE POLICY "Users can view event attendees"
  ON public.calendar_event_attendees FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Event organizers or Admins can invite attendees" ON public.calendar_event_attendees;
CREATE POLICY "Event organizers or Admins can invite attendees"
  ON public.calendar_event_attendees FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Attendees can update their own RSVP status" ON public.calendar_event_attendees;
CREATE POLICY "Attendees can update their own RSVP status"
  ON public.calendar_event_attendees FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Organizers or Users can remove invitations" ON public.calendar_event_attendees;
CREATE POLICY "Organizers or Users can remove invitations"
  ON public.calendar_event_attendees FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 7. Enable Realtime Replication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
