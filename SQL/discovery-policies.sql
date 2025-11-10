-- ============================================
-- DISCOVERY FEATURE RLS POLICIES
-- Allow users to view other users' profiles for discovery
-- ============================================

-- ============================================
-- 1. Dating Profiles - Allow viewing completed profiles
-- ============================================
CREATE POLICY "Users can view completed dating profiles for discovery"
  ON dating_profiles FOR SELECT
  USING (setup_completed = true);

-- ============================================
-- 2. User Profiles - Allow viewing for age calculation
-- ============================================
CREATE POLICY "Users can view user profiles for discovery"
  ON user_profiles FOR SELECT
  USING (true);

-- ============================================
-- 3. Profile Photos - Allow viewing others' photos
-- ============================================
CREATE POLICY "Users can view profile photos for discovery"
  ON profile_photos FOR SELECT
  USING (true);

-- ============================================
-- 4. Profile Interests - Allow viewing others' interests
-- ============================================
CREATE POLICY "Users can view profile interests for discovery"
  ON profile_interests FOR SELECT
  USING (true);

-- ============================================
-- 5. Relationship Goals - Allow viewing others' goals
-- ============================================
CREATE POLICY "Users can view relationship goals for discovery"
  ON relationship_goals FOR SELECT
  USING (true);

-- ============================================
-- 6. ID Verifications - Allow viewing verification status
-- ============================================
CREATE POLICY "Users can view verification status for discovery"
  ON id_verifications FOR SELECT
  USING (true);

-- ============================================
-- 7. Dating Preferences - Allow viewing preferences
-- ============================================
CREATE POLICY "Users can view dating preferences for discovery"
  ON dating_preferences FOR SELECT
  USING (true);

-- ============================================
-- 8. Profile Prompts - Allow viewing others' prompts
-- ============================================
CREATE POLICY "Users can view profile prompts for discovery"
  ON profile_prompts FOR SELECT
  USING (true);

-- Note: Run this script in your Supabase SQL Editor to enable discovery features
-- This allows authenticated users to view other users' profiles for matching purposes

