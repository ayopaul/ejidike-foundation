-- =====================================================
-- Check and Fix ALL RLS Policies
-- =====================================================
-- Run this entire file in Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'notifications';

-- Now fix the notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

-- Create correct policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Verify the new policies were created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'notifications';
