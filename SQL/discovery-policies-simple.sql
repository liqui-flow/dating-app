-- ============================================
-- DISCOVERY FEATURE RLS POLICIES FOR CONSOLIDATED TABLES
-- Allow users to view other users' profiles for discovery
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Dating Profile Full - Allow viewing completed profiles for discovery
-- ============================================
-- First, drop the policy if it already exists (ignore error if it doesn't exist)
DROP POLICY IF EXISTS "Users can view completed dating profiles for discovery" ON dating_profile_full;

-- Create policy to allow viewing completed profiles (excluding own profile)
-- This works alongside the existing "Users can view own dating profile full" policy
CREATE POLICY "Users can view completed dating profiles for discovery"
  ON dating_profile_full FOR SELECT
  USING (
    setup_completed = true 
    AND auth.uid() IS NOT NULL
    AND user_id != auth.uid()
  );

-- ============================================
-- 2. Matrimony Profile Full - Allow viewing completed profiles for discovery
-- ============================================
-- First, drop the policy if it already exists (ignore error if it doesn't exist)
DROP POLICY IF EXISTS "Users can view completed matrimony profiles for discovery" ON matrimony_profile_full;

-- Create policy to allow viewing completed profiles (excluding own profile)
-- This works alongside the existing "Users can view own matrimony profile full" policy
CREATE POLICY "Users can view completed matrimony profiles for discovery"
  ON matrimony_profile_full FOR SELECT
  USING (
    profile_completed = true 
    AND auth.uid() IS NOT NULL
    AND user_id != auth.uid()
  );

-- ============================================
-- 3. User Profiles - Allow viewing for age calculation and discovery
-- ============================================
-- Drop and recreate to ensure it exists
DROP POLICY IF EXISTS "Users can view user profiles for discovery" ON user_profiles;

CREATE POLICY "Users can view user profiles for discovery"
  ON user_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 4. ID Verifications - Allow viewing verification status for discovery
-- ============================================
-- Drop and recreate to ensure it exists
DROP POLICY IF EXISTS "Users can view verification status for discovery" ON id_verifications;

CREATE POLICY "Users can view verification status for discovery"
  ON id_verifications FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- VERIFICATION QUERIES (Optional - run these to verify policies are working)
-- ============================================
-- Check if policies were created successfully:
-- SELECT * FROM pg_policies WHERE tablename IN ('dating_profile_full', 'matrimony_profile_full');

-- Test query (run this as an authenticated user to see if you can view other profiles):
-- SELECT user_id, name, setup_completed FROM dating_profile_full WHERE setup_completed = true LIMIT 5;

