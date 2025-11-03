-- ============================================
-- DATING PROFILES DATABASE SCHEMA
-- Complete schema for storing dating profile data
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. DATING PROFILES TABLE (Basic Info)
-- Stores name, basic profile information
-- ============================================
CREATE TABLE IF NOT EXISTS dating_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  name VARCHAR(100) NOT NULL,
  
  -- Profile Media
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
  CONSTRAINT unique_dating_profile_user UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_dating_profiles_user_id ON dating_profiles(user_id);
CREATE INDEX idx_dating_profiles_setup_completed ON dating_profiles(setup_completed);

-- ============================================
-- 2. PROFILE PHOTOS TABLE
-- Stores multiple photos for each profile
-- ============================================
CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Photo information
  photo_url TEXT NOT NULL,
  photo_file_name TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_profile_photos_user_id ON profile_photos(user_id);
CREATE INDEX idx_profile_photos_display_order ON profile_photos(display_order);

-- ============================================
-- 3. DATING PREFERENCES TABLE
-- Stores who the user wants to date
-- ============================================
CREATE TABLE IF NOT EXISTS dating_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preference settings
  looking_for VARCHAR(20) CHECK (looking_for IN ('men', 'women', 'everyone')),
  show_on_profile BOOLEAN DEFAULT TRUE,
  
  -- Age and distance preferences
  min_age INTEGER DEFAULT 18 CHECK (min_age >= 18 AND min_age <= 100),
  max_age INTEGER DEFAULT 35 CHECK (max_age >= 18 AND max_age <= 100),
  max_distance INTEGER DEFAULT 25 CHECK (max_distance >= 5 AND max_distance <= 500),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_dating_preferences_user UNIQUE (user_id),
  CONSTRAINT valid_age_range CHECK (max_age >= min_age)
);

-- Create indexes
CREATE INDEX idx_dating_preferences_user_id ON dating_preferences(user_id);
CREATE INDEX idx_dating_preferences_looking_for ON dating_preferences(looking_for);

-- ============================================
-- 4. PROFILE INTERESTS TABLE
-- Stores selected interests
-- ============================================
CREATE TABLE IF NOT EXISTS profile_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Interest information
  interest_category VARCHAR(50),
  interest_name VARCHAR(100) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_profile_interests_user_id ON profile_interests(user_id);
CREATE INDEX idx_profile_interests_category ON profile_interests(interest_category);

-- ============================================
-- 5. PROFILE PROMPTS TABLE
-- Stores answers to profile prompts
-- ============================================
CREATE TABLE IF NOT EXISTS profile_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Prompt information
  prompt_question TEXT NOT NULL,
  prompt_answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_profile_prompts_user_id ON profile_prompts(user_id);
CREATE INDEX idx_profile_prompts_display_order ON profile_prompts(display_order);

-- ============================================
-- 6. THIS OR THAT CHOICES TABLE
-- Stores user's "this or that" selections
-- ============================================
CREATE TABLE IF NOT EXISTS this_or_that_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Choice information
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  selected_option INTEGER CHECK (selected_option IN (0, 1)), -- 0 for option_a, 1 for option_b
  question_index INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_this_or_that_user_id ON this_or_that_choices(user_id);

-- ============================================
-- 7. RELATIONSHIP GOALS TABLE
-- Stores user's relationship intentions
-- ============================================
CREATE TABLE IF NOT EXISTS relationship_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal information
  goal_description TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_relationship_goal_user UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_relationship_goals_user_id ON relationship_goals(user_id);

-- ============================================
-- 8. UPDATE TIMESTAMP TRIGGER FUNCTION
-- Automatically updates the updated_at column
-- ============================================
CREATE OR REPLACE FUNCTION update_dating_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at
CREATE TRIGGER update_dating_profiles_timestamp
  BEFORE UPDATE ON dating_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_dating_profiles_updated_at();

CREATE TRIGGER update_profile_photos_timestamp
  BEFORE UPDATE ON profile_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_dating_profiles_updated_at();

CREATE TRIGGER update_dating_preferences_timestamp
  BEFORE UPDATE ON dating_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_dating_profiles_updated_at();

CREATE TRIGGER update_profile_prompts_timestamp
  BEFORE UPDATE ON profile_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_dating_profiles_updated_at();

CREATE TRIGGER update_relationship_goals_timestamp
  BEFORE UPDATE ON relationship_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_dating_profiles_updated_at();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE dating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE this_or_that_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_goals ENABLE ROW LEVEL SECURITY;

-- Dating Profiles Policies
CREATE POLICY "Users can view own dating profile"
  ON dating_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dating profile"
  ON dating_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dating profile"
  ON dating_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Profile Photos Policies
CREATE POLICY "Users can view own photos"
  ON profile_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON profile_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON profile_photos FOR UPDATE
  USING (auth.uid() = user_id);

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
  USING (auth.uid() = user_id);

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
  USING (auth.uid() = user_id);

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
  USING (auth.uid() = user_id);

-- ============================================
-- 10. STORAGE BUCKETS
-- ============================================
-- You need to create these buckets manually in Supabase Dashboard:
-- Bucket name: 'profile-photos' (PUBLIC or PRIVATE based on your needs)
-- Bucket name: 'profile-videos' (PUBLIC or PRIVATE based on your needs)

-- ============================================
-- 11. HELPER FUNCTIONS
-- ============================================

-- Function to get complete dating profile
CREATE OR REPLACE FUNCTION get_complete_dating_profile(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(dp.*) FROM dating_profiles dp WHERE dp.user_id = p_user_id),
    'photos', (SELECT json_agg(row_to_json(pp.*)) FROM profile_photos pp WHERE pp.user_id = p_user_id ORDER BY display_order),
    'preferences', (SELECT row_to_json(dpref.*) FROM dating_preferences dpref WHERE dpref.user_id = p_user_id),
    'interests', (SELECT json_agg(row_to_json(pi.*)) FROM profile_interests pi WHERE pi.user_id = p_user_id),
    'prompts', (SELECT json_agg(row_to_json(pp.*)) FROM profile_prompts pp WHERE pp.user_id = p_user_id ORDER BY display_order),
    'choices', (SELECT json_agg(row_to_json(tot.*)) FROM this_or_that_choices tot WHERE tot.user_id = p_user_id),
    'goal', (SELECT row_to_json(rg.*) FROM relationship_goals rg WHERE rg.user_id = p_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check profile completion status
CREATE OR REPLACE FUNCTION get_dating_profile_completion(p_user_id UUID)
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
    EXISTS(SELECT 1 FROM dating_profiles WHERE user_id = p_user_id) AS has_profile,
    COALESCE(dp.setup_completed, FALSE) AS setup_completed,
    COALESCE(dp.preferences_completed, FALSE) AS preferences_completed,
    COALESCE(dp.questionnaire_completed, FALSE) AS questionnaire_completed,
    CASE
      WHEN dp.setup_completed AND dp.preferences_completed AND dp.questionnaire_completed THEN 100
      WHEN dp.setup_completed AND dp.preferences_completed THEN 66
      WHEN dp.setup_completed THEN 33
      ELSE 0
    END AS overall_completion_percentage
  FROM dating_profiles dp
  WHERE dp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

