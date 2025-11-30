-- =====================================================
-- Cleanup Duplicate Profiles Migration
-- =====================================================
-- This script removes duplicate profile entries,
-- keeping only the newest profile for each user_id

-- Step 1: Check for duplicates (optional - just to see what we have)
-- Uncomment and run first to see the duplicates:
-- SELECT user_id, COUNT(*) as count, array_agg(id) as profile_ids
-- FROM profiles
-- GROUP BY user_id
-- HAVING COUNT(*) > 1;

-- Step 2: Delete older duplicate profiles, keep the newest one
DELETE FROM profiles
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM profiles
  ) t
  WHERE rn > 1
);

-- Step 3: Verify no more duplicates (optional)
-- Uncomment to verify cleanup:
-- SELECT user_id, COUNT(*) as count
-- FROM profiles
-- GROUP BY user_id
-- HAVING COUNT(*) > 1;
