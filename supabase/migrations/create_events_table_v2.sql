-- =====================================================
-- Create Events Table (Version 2 - with DROP IF EXISTS)
-- =====================================================
-- This script creates the events table for admin-managed events

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can cancel own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.event_registrations;

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS events_updated_at ON public.events;
DROP FUNCTION IF EXISTS update_events_updated_at();

-- Create the events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'webinar', -- webinar, workshop, conference, networking, training, other
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT, -- Physical location or 'Virtual'
  meeting_link TEXT, -- Zoom, Google Meet, etc.
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered', -- registered, attended, cancelled
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Events policies
-- Allow everyone to view published events
CREATE POLICY "Anyone can view published events"
  ON public.events
  FOR SELECT
  TO public
  USING (is_published = true);

-- Allow admins to manage events
CREATE POLICY "Admins can manage events"
  ON public.events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Event registrations policies
-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
  ON public.event_registrations
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Users can register for events
CREATE POLICY "Users can register for events"
  ON public.event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Users can cancel their own registrations
CREATE POLICY "Users can cancel own registrations"
  ON public.event_registrations
  FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all registrations
CREATE POLICY "Admins can manage all registrations"
  ON public.event_registrations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();
