-- ============================================
-- DATING PROFILE FULL - CONSOLIDATED TABLE MIGRATION
-- This migration creates a single consolidated table for all dating profile data
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CREATE DATING_PROFILE_FULL TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS dating_profile_full (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  name VARCHAR(100) NOT NULL,
  dob DATE,
  gender VARCHAR(50),
  bio TEXT,
  
  -- JSONB columns for complex data
  interests JSONB DEFAULT '[]'::jsonb, -- Array of interest strings (e.g., ["Music", "Travel", "Food"])
  prompts JSONB DEFAULT '[]'::jsonb, -- Array of prompt/answer objects (e.g., [{"prompt": "Best trip", "answer": "Goa"}])
  photos JSONB DEFAULT '[]'::jsonb, -- Array of photo URLs (e.g., ["https://...", "https://..."])
  preferences JSONB DEFAULT '{}'::jsonb, -- Dating preferences object (e.g., {"min_age": 18, "max_age": 35, "looking_for": "women", ...})
  this_or_that_choices JSONB DEFAULT '[]'::jsonb, -- Array of this or that choices (e.g., [{"option_a": "Beach", "option_b": "Mountains", "selected": 0}])
  
  -- Relationship goals
  relationship_goals VARCHAR(255),
  
  -- Profile Media (optional, for backward compatibility)
  video_url TEXT,
  video_file_name TEXT,
  
  -- Profile completion tracking
  setup_completed BOOLEAN DEFAULT FALSE,
  preferences_completed BOOLEAN DEFAULT FALSE,
  questionnaire_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_dating_profile_full_user UNIQUE (user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_dating_profile_full_user_id ON dating_profile_full(user_id);
CREATE INDEX idx_dating_profile_full_setup_completed ON dating_profile_full(setup_completed);
CREATE INDEX idx_dating_profile_full_gender ON dating_profile_full(gender);
CREATE INDEX idx_dating_profile_full_interests ON dating_profile_full USING GIN (interests);
CREATE INDEX idx_dating_profile_full_preferences ON dating_profile_full USING GIN (preferences);

-- ============================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_dating_profile_full_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dating_profile_full_timestamp
  BEFORE UPDATE ON dating_profile_full
  FOR EACH ROW
  EXECUTE FUNCTION update_dating_profile_full_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE dating_profile_full ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own dating profile full"
  ON dating_profile_full FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own dating profile full"
  ON dating_profile_full FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own dating profile full"
  ON dating_profile_full FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own dating profile full"
  ON dating_profile_full FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get complete dating profile
CREATE OR REPLACE FUNCTION get_complete_dating_profile_full(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT row_to_json(dp.*) INTO result
  FROM dating_profile_full dp
  WHERE dp.user_id = p_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check profile completion status
CREATE OR REPLACE FUNCTION get_dating_profile_completion_full(p_user_id UUID)
RETURNS TABLE(
  has_profile BOOLEAN,
  setup_completed BOOLEAN,
  preferences_completed BOOLEAN,
  questionnaire_completed BOOLEAN,
  overall_completion_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXISTS(SELECT 1 FROM dating_profile_full WHERE user_id = p_user_id) AS has_profile,
    COALESCE(dp.setup_completed, FALSE) AS setup_completed,
    COALESCE(dp.preferences_completed, FALSE) AS preferences_completed,
    COALESCE(dp.questionnaire_completed, FALSE) AS questionnaire_completed,
    CASE
      WHEN dp.setup_completed AND dp.preferences_completed AND dp.questionnaire_completed THEN 100
      WHEN dp.setup_completed AND dp.preferences_completed THEN 66
      WHEN dp.setup_completed THEN 33
      ELSE 0
    END AS overall_completion_percentage
  FROM dating_profile_full dp
  WHERE dp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION NOTES
-- ============================================
-- After running this migration and verifying everything works:
-- 1. Test all insert/update/select operations
-- 2. Once confirmed working, you can drop the old tables:
--    DROP TABLE IF EXISTS this_or_that_choices;
--    DROP TABLE IF EXISTS relationship_goals;
--    DROP TABLE IF EXISTS profile_prompts;
--    DROP TABLE IF EXISTS profile_interests;
--    DROP TABLE IF EXISTS profile_photos;
--    DROP TABLE IF EXISTS dating_preferences;
--    DROP TABLE IF EXISTS dating_profiles;
-- 3. Drop old helper functions if they exist:
--    DROP FUNCTION IF EXISTS get_complete_dating_profile(UUID);
--    DROP FUNCTION IF EXISTS get_dating_profile_completion(UUID);

