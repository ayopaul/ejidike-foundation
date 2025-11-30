-- =====================================================
-- NUCLEAR FIX: Completely reset notifications RLS
-- =====================================================

-- Disable RLS temporarily
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.notifications';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create fresh policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
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
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Verify policies
SELECT policyname, cmd, roles, with_check
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;
