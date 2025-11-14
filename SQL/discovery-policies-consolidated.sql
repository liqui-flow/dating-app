-- ============================================
-- DISCOVERY FEATURE RLS POLICIES FOR CONSOLIDATED TABLES
-- Allow users to view other users' profiles for discovery
-- ============================================

-- ============================================
-- 1. Dating Profile Full - Allow viewing completed profiles for discovery
-- ============================================
-- Drop existing discovery policy if it exists (to avoid conflicts)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'dating_profile_full' 
    AND policyname = 'Users can view completed dating profiles for discovery'
  ) THEN
    DROP POLICY "Users can view completed dating profiles for discovery" ON dating_profile_full;
  END IF;
END $$;

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
-- Drop existing discovery policy if it exists (to avoid conflicts)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'matrimony_profile_full' 
    AND policyname = 'Users can view completed matrimony profiles for discovery'
  ) THEN
    DROP POLICY "Users can view completed matrimony profiles for discovery" ON matrimony_profile_full;
  END IF;
END $$;

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
-- Ensure user_profiles has discovery policy (if not already exists)
DROP POLICY IF EXISTS "Users can view user profiles for discovery" ON user_profiles;

CREATE POLICY "Users can view user profiles for discovery"
  ON user_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 4. ID Verifications - Allow viewing verification status for discovery
-- ============================================
-- Ensure id_verifications has discovery policy (if not already exists)
DROP POLICY IF EXISTS "Users can view verification status for discovery" ON id_verifications;

CREATE POLICY "Users can view verification status for discovery"
  ON id_verifications FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Note: Run this script in your Supabase SQL Editor to enable discovery features
-- This allows authenticated users to view other users' completed profiles for matching purposes

