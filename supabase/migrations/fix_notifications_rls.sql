-- =====================================================
-- Fix Notifications RLS Policies
-- =====================================================
-- The current INSERT policy is too restrictive
-- We need to allow authenticated users to create notifications for other users

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- Create a more permissive INSERT policy
-- This allows any authenticated user to create notifications for any user
-- This is needed because notifications are created by the system on behalf of users
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: In production, you might want to add additional checks here
-- For example, only allowing certain roles or using a service role
