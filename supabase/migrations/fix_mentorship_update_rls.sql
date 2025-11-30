-- =====================================================
-- Fix Mentorship Matches UPDATE RLS for Withdrawal
-- =====================================================
-- Allow mentees to update (withdraw) their requests

-- Drop existing UPDATE policies if they exist
DROP POLICY IF EXISTS "Mentees can update own requests" ON public.mentorship_matches;
DROP POLICY IF EXISTS "Mentors can update mentorship status" ON public.mentorship_matches;

-- Allow mentees to update their own requests (for withdrawal)
CREATE POLICY "Mentees can update own requests"
  ON public.mentorship_matches
  FOR UPDATE
  USING (
    mentee_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    mentee_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Allow mentors to update their mentorship matches (for accept/reject)
CREATE POLICY "Mentors can update mentorship status"
  ON public.mentorship_matches
  FOR UPDATE
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

-- Verify policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'mentorship_matches' AND cmd = 'UPDATE';
