-- ============================================
-- ADD INSERT POLICIES FOR MATCHES TABLES
-- This fixes the RLS error when "Like Back" creates a match
-- ============================================

-- Drop existing INSERT policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can insert own matches" ON dating_matches;
DROP POLICY IF EXISTS "Users can insert own matches" ON matrimony_matches;

-- Add INSERT policy for dating_matches
-- Allows users to insert matches where they are one of the matched users
CREATE POLICY "Users can insert own matches"
  ON dating_matches FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Add INSERT policy for matrimony_matches
-- Allows users to insert matches where they are one of the matched users
CREATE POLICY "Users can insert own matches"
  ON matrimony_matches FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

