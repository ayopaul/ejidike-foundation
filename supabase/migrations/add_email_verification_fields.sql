-- Migration: Add email verification fields to profiles table
-- Run this in Supabase SQL Editor

-- Add email verification columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMPTZ;

-- Create index on verification token for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email_verification_token
ON profiles(email_verification_token)
WHERE email_verification_token IS NOT NULL;

-- Set existing users as verified (optional - only if you want to grandfather in existing users)
-- UPDATE profiles SET email_verified = true WHERE email_verified IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.email_verified IS 'Whether the user email has been verified';
COMMENT ON COLUMN profiles.email_verification_token IS 'Token for email verification, cleared after verification';
COMMENT ON COLUMN profiles.email_verification_expires IS 'When the verification token expires';
