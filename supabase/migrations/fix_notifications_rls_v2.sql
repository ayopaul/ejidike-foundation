-- =====================================================
-- Fix Notifications RLS Policies (v2)
-- =====================================================
-- The user_id field references profiles.id, not auth.uid()
-- We need to fix all policies to properly check against the profile

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

-- SELECT: Users can view notifications where user_id matches their profile.id
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- INSERT: Authenticated users can create notifications for any user
-- This is needed because notifications are created by the system on behalf of users
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- DELETE: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
