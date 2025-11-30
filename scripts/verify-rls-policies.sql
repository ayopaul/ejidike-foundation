-- Check what RLS policies currently exist for notifications
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;
