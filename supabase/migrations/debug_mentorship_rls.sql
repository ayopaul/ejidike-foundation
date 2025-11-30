-- Debug script to check RLS policies and profile data

-- 1. Check existing policies on mentorship_matches
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'mentorship_matches';

-- 2. Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'mentorship_matches';

-- 3. Check your profile data (run this while logged in as applicant)
-- This will show if you have duplicate profiles or profile ID issues
SELECT
  id,
  user_id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles
WHERE user_id = auth.uid();
