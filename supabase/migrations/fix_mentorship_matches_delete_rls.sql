-- =====================================================
-- Fix Mentorship Matches DELETE RLS Policy
-- =====================================================
-- Allow mentees to withdraw their requests

-- Drop existing DELETE policy if it exists
DROP POLICY IF EXISTS "Users can delete own mentorship requests" ON public.mentorship_matches;

-- Allow mentees to delete their own mentorship requests
CREATE POLICY "Mentees can delete own requests"
  ON public.mentorship_matches
  FOR DELETE
  USING (
    mentee_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
