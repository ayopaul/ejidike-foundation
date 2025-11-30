-- =====================================================
-- Fix Mentorship Matches RLS Policies
-- =====================================================
-- This script adds RLS policies for mentorship_matches table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create mentorship requests as mentee" ON public.mentorship_matches;
DROP POLICY IF EXISTS "Mentors can view their mentorship matches" ON public.mentorship_matches;
DROP POLICY IF EXISTS "Mentees can view their mentorship matches" ON public.mentorship_matches;
DROP POLICY IF EXISTS "Mentors can update their mentorship matches" ON public.mentorship_matches;

-- Enable RLS (in case it's not already enabled)
ALTER TABLE public.mentorship_matches ENABLE ROW LEVEL SECURITY;

-- Allow users to create mentorship requests where they are the mentee
CREATE POLICY "Users can create mentorship requests as mentee"
  ON public.mentorship_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    mentee_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Allow mentors to view matches where they are the mentor
CREATE POLICY "Mentors can view their mentorship matches"
  ON public.mentorship_matches
  FOR SELECT
  TO authenticated
  USING (
    mentor_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Allow mentees to view matches where they are the mentee
CREATE POLICY "Mentees can view their mentorship matches"
  ON public.mentorship_matches
  FOR SELECT
  TO authenticated
  USING (
    mentee_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Allow mentors to update matches where they are the mentor (for accept/reject)
CREATE POLICY "Mentors can update their mentorship matches"
  ON public.mentorship_matches
  FOR UPDATE
  TO authenticated
  USING (
    mentor_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    mentor_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
