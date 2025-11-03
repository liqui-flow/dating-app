-- ============================================
-- FIX FOR RLS POLICY VIOLATION ERROR
-- Run this if you're getting "new row violates row-level security policy"
-- ============================================

-- First, let's make sure RLS is enabled but with proper policies
-- Sometimes the policies need to be recreated

-- ============================================
-- 1. DROP EXISTING POLICIES (if they exist)
-- ============================================

-- Dating Profiles
DROP POLICY IF EXISTS "Users can view own dating profile" ON dating_profiles;
DROP POLICY IF EXISTS "Users can insert own dating profile" ON dating_profiles;
DROP POLICY IF EXISTS "Users can update own dating profile" ON dating_profiles;

-- Profile Photos
DROP POLICY IF EXISTS "Users can view own photos" ON profile_photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON profile_photos;
DROP POLICY IF EXISTS "Users can update own photos" ON profile_photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON profile_photos;

-- Dating Preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON dating_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON dating_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON dating_preferences;

-- Profile Interests
DROP POLICY IF EXISTS "Users can view own interests" ON profile_interests;
DROP POLICY IF EXISTS "Users can insert own interests" ON profile_interests;
DROP POLICY IF EXISTS "Users can delete own interests" ON profile_interests;

-- Profile Prompts
DROP POLICY IF EXISTS "Users can view own prompts" ON profile_prompts;
DROP POLICY IF EXISTS "Users can insert own prompts" ON profile_prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON profile_prompts;
DROP POLICY IF EXISTS "Users can delete own prompts" ON profile_prompts;

-- This or That Choices
DROP POLICY IF EXISTS "Users can view own choices" ON this_or_that_choices;
DROP POLICY IF EXISTS "Users can insert own choices" ON this_or_that_choices;
DROP POLICY IF EXISTS "Users can delete own choices" ON this_or_that_choices;

-- Relationship Goals
DROP POLICY IF EXISTS "Users can view own goals" ON relationship_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON relationship_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON relationship_goals;

-- ============================================
-- 2. RECREATE POLICIES WITH PROPER PERMISSIONS
-- ============================================

-- Dating Profiles Policies
CREATE POLICY "Users can view own dating profile"
  ON dating_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dating profile"
  ON dating_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dating profile"
  ON dating_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profile Photos Policies
CREATE POLICY "Users can view own photos"
  ON profile_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON profile_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON profile_photos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON profile_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Dating Preferences Policies
CREATE POLICY "Users can view own preferences"
  ON dating_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON dating_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON dating_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profile Interests Policies
CREATE POLICY "Users can view own interests"
  ON profile_interests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interests"
  ON profile_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interests"
  ON profile_interests FOR DELETE
  USING (auth.uid() = user_id);

-- Profile Prompts Policies
CREATE POLICY "Users can view own prompts"
  ON profile_prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts"
  ON profile_prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts"
  ON profile_prompts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts"
  ON profile_prompts FOR DELETE
  USING (auth.uid() = user_id);

-- This or That Choices Policies
CREATE POLICY "Users can view own choices"
  ON this_or_that_choices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own choices"
  ON this_or_that_choices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own choices"
  ON this_or_that_choices FOR DELETE
  USING (auth.uid() = user_id);

-- Relationship Goals Policies
CREATE POLICY "Users can view own goals"
  ON relationship_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON relationship_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON relationship_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. VERIFY RLS IS ENABLED
-- ============================================

ALTER TABLE dating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE this_or_that_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_goals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DONE! Now test your app again
-- ============================================

