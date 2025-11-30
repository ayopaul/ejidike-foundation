-- =====================================================
-- Fix Mentorship Matches RLS Policies (Version 2)
-- =====================================================
-- Simplified approach that should work more reliably

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can create mentorship requests as mentee" ON public.mentorship_matches;
DROP POLICY IF EXISTS "Mentors can view their mentorship matches" ON public.mentorship_matches;
DROP POLICY IF EXISTS "Mentees can view their mentorship matches" ON public.mentorship_matches;
DROP POLICY IF EXISTS "Mentors can update their mentorship matches" ON public.mentorship_matches;

-- Enable RLS
ALTER TABLE public.mentorship_matches ENABLE ROW LEVEL SECURITY;

-- Allow users to create mentorship requests where they are the mentee
-- This checks if the mentee_id matches a profile.id where user_id = auth.uid()
CREATE POLICY "Users can create mentorship requests as mentee"
  ON public.mentorship_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = mentorship_matches.mentee_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Allow mentors to view matches where they are the mentor
CREATE POLICY "Mentors can view their mentorship matches"
  ON public.mentorship_matches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = mentorship_matches.mentor_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Allow mentees to view matches where they are the mentee
CREATE POLICY "Mentees can view their mentorship matches"
  ON public.mentorship_matches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = mentorship_matches.mentee_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Allow mentors to update matches where they are the mentor (for accept/reject)
CREATE POLICY "Mentors can update their mentorship matches"
  ON public.mentorship_matches
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = mentorship_matches.mentor_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = mentorship_matches.mentor_id
      AND profiles.user_id = auth.uid()
    )
  );
