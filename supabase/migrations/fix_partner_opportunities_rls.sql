-- Fix RLS policies for partner_opportunities table
-- Allow partners to create and manage their own opportunities

-- Enable RLS on partner_opportunities (if not already enabled)
ALTER TABLE partner_opportunities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Partners can view own opportunities" ON partner_opportunities;
DROP POLICY IF EXISTS "Partners can insert own opportunities" ON partner_opportunities;
DROP POLICY IF EXISTS "Partners can update own opportunities" ON partner_opportunities;
DROP POLICY IF EXISTS "Partners can delete own opportunities" ON partner_opportunities;
DROP POLICY IF EXISTS "Public can view open opportunities" ON partner_opportunities;

-- Policy 1: Partners can view their own opportunities
CREATE POLICY "Partners can view own opportunities"
  ON partner_opportunities
  FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partner_organizations
      WHERE user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Policy 2: Partners can insert opportunities for their verified organization
CREATE POLICY "Partners can insert own opportunities"
  ON partner_opportunities
  FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT id FROM partner_organizations
      WHERE user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
      AND verification_status = 'verified'
    )
  );

-- Policy 3: Partners can update their own opportunities
CREATE POLICY "Partners can update own opportunities"
  ON partner_opportunities
  FOR UPDATE
  USING (
    partner_id IN (
      SELECT id FROM partner_organizations
      WHERE user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    partner_id IN (
      SELECT id FROM partner_organizations
      WHERE user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Policy 4: Partners can delete their own opportunities
CREATE POLICY "Partners can delete own opportunities"
  ON partner_opportunities
  FOR DELETE
  USING (
    partner_id IN (
      SELECT id FROM partner_organizations
      WHERE user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Policy 5: Public can view all open opportunities (for applicants to browse)
CREATE POLICY "Public can view open opportunities"
  ON partner_opportunities
  FOR SELECT
  USING (status = 'open');

-- Policy 6: Admins can view all opportunities
CREATE POLICY "Admins can view all opportunities"
  ON partner_opportunities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy 7: Admins can update any opportunity
CREATE POLICY "Admins can update all opportunities"
  ON partner_opportunities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
