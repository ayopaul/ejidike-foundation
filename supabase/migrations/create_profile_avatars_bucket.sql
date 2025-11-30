-- =====================================================
-- Create Profile Avatars Storage Bucket
-- =====================================================
-- This script creates a storage bucket for profile avatars
-- and sets up RLS policies for secure uploads

-- Create the profile-avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- Allow everyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
);
