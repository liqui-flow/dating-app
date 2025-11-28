-- ============================================
-- MATRIMONY PROFILES DATABASE SCHEMA
-- Complete schema for storing matrimony profile data (7 steps)
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. MATRIMONY PROFILES TABLE (Main Profile)
-- Stores basic profile information from Step 1
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Step 1: Welcome & Identity
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age >= 18 AND age <= 80),
  gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
  created_by VARCHAR(20) CHECK (created_by IN ('Self', 'Parent', 'Sibling', 'Other')),
  
  -- Profile completion tracking
  step1_completed BOOLEAN DEFAULT FALSE,
  step2_completed BOOLEAN DEFAULT FALSE,
  step3_completed BOOLEAN DEFAULT FALSE,
  step4_completed BOOLEAN DEFAULT FALSE,
  step5_completed BOOLEAN DEFAULT FALSE,
  step6_completed BOOLEAN DEFAULT FALSE,
  step7_completed BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_matrimony_profile_user UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_matrimony_profiles_user_id ON matrimony_profiles(user_id);
CREATE INDEX idx_matrimony_profiles_gender ON matrimony_profiles(gender);
CREATE INDEX idx_matrimony_profiles_age ON matrimony_profiles(age);
CREATE INDEX idx_matrimony_profiles_completed ON matrimony_profiles(profile_completed);

-- ============================================
-- 2. MATRIMONY PHOTOS TABLE
-- Stores multiple photos (3-6) for each profile
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Photo information
  photo_url TEXT NOT NULL,
  photo_file_name TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_matrimony_photos_user_id ON matrimony_photos(user_id);
CREATE INDEX idx_matrimony_photos_display_order ON matrimony_photos(display_order);

-- ============================================
-- 3. PERSONAL PHYSICAL DETAILS TABLE
-- Stores Step 2: Physical attributes and personal details
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_personal_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Physical attributes
  height_cm INTEGER CHECK (height_cm >= 90 AND height_cm <= 250),
  height_unit VARCHAR(10) DEFAULT 'cm',
  complexion VARCHAR(20),
  body_type VARCHAR(20),
  
  -- Lifestyle
  diet VARCHAR(30),
  smoker BOOLEAN DEFAULT FALSE,
  drinker BOOLEAN DEFAULT FALSE,
  marital_status VARCHAR(30) CHECK (marital_status IN ('Never Married', 'Divorced', 'Widowed', 'Annulled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_matrimony_personal_user UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_matrimony_personal_user_id ON matrimony_personal_details(user_id);
CREATE INDEX idx_matrimony_personal_height ON matrimony_personal_details(height_cm);
CREATE INDEX idx_matrimony_personal_marital ON matrimony_personal_details(marital_status);

-- ============================================
-- 4. CAREER AND EDUCATION TABLE
-- Stores Step 3: Professional and educational background
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_career_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Education
  highest_education VARCHAR(100),
  college VARCHAR(200),
  
  -- Career
  job_title VARCHAR(100),
  company VARCHAR(200),
  annual_income VARCHAR(50),
  
  -- Work location
  work_city VARCHAR(100),
  work_state VARCHAR(100),
  work_country VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_matrimony_career_user UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_matrimony_career_user_id ON matrimony_career_education(user_id);
CREATE INDEX idx_matrimony_career_education ON matrimony_career_education(highest_education);

-- ============================================
-- 5. FAMILY INFORMATION TABLE
-- Stores Step 4: Family details
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_family_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Family type and values
  family_type VARCHAR(20),
  family_values VARCHAR(20),
  
  -- Father details
  father_occupation VARCHAR(100),
  father_company VARCHAR(200),
  
  -- Mother details
  mother_occupation VARCHAR(100),
  mother_company VARCHAR(200),
  
  -- Siblings
  brothers INTEGER DEFAULT 0 CHECK (brothers >= 0 AND brothers <= 10),
  sisters INTEGER DEFAULT 0 CHECK (sisters >= 0 AND sisters <= 10),
  siblings_married VARCHAR(20),
  
  -- Visibility
  show_on_profile BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_matrimony_family_user UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_matrimony_family_user_id ON matrimony_family_info(user_id);

-- ============================================
-- 6. CULTURAL AND RELIGIOUS DETAILS TABLE
-- Stores Step 5: Cultural, religious, and astrological information
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_cultural_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Religious and cultural
  religion VARCHAR(50),
  mother_tongue VARCHAR(50),
  community VARCHAR(100),
  sub_caste VARCHAR(100),
  
  -- Birth details
  date_of_birth DATE,
  time_of_birth TIME,
  place_of_birth VARCHAR(200),
  
  -- Astrological
  star_raashi VARCHAR(50),
  gotra VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_matrimony_cultural_user UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_matrimony_cultural_user_id ON matrimony_cultural_details(user_id);
CREATE INDEX idx_matrimony_cultural_religion ON matrimony_cultural_details(religion);
CREATE INDEX idx_matrimony_cultural_community ON matrimony_cultural_details(community);

-- ============================================
-- 7. BIO TABLE
-- Stores Step 6: Personal bio/description
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_bio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Bio text
  bio TEXT CHECK (LENGTH(bio) >= 20 AND LENGTH(bio) <= 300),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_matrimony_bio_user UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_matrimony_bio_user_id ON matrimony_bio(user_id);

-- ============================================
-- 8. PARTNER PREFERENCES TABLE
-- Stores Step 7: Partner preferences
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_partner_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Age and height preferences
  min_age INTEGER CHECK (min_age >= 18 AND min_age <= 80),
  max_age INTEGER CHECK (max_age >= 18 AND max_age <= 80),
  min_height_cm INTEGER CHECK (min_height_cm >= 90 AND min_height_cm <= 250),
  max_height_cm INTEGER CHECK (max_height_cm >= 90 AND max_height_cm <= 250),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_matrimony_preferences_user UNIQUE (user_id),
  CONSTRAINT valid_age_range CHECK (max_age >= min_age),
  CONSTRAINT valid_height_range CHECK (max_height_cm >= min_height_cm)
);

-- Create indexes
CREATE INDEX idx_matrimony_preferences_user_id ON matrimony_partner_preferences(user_id);

-- ============================================
-- 9. PARTNER PREFERENCE ARRAYS TABLE
-- Stores array preferences (locations, education, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS matrimony_preference_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_type VARCHAR(50) CHECK (preference_type IN (
    'diet', 'lifestyle', 'education', 'profession', 
    'location', 'community', 'family_type'
  )),
  preference_value VARCHAR(200) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_matrimony_pref_details_user_id ON matrimony_preference_details(user_id);
CREATE INDEX idx_matrimony_pref_details_type ON matrimony_preference_details(preference_type);

-- ============================================
-- 10. UPDATE TIMESTAMP TRIGGER FUNCTION
-- Automatically updates the updated_at column
-- ============================================
CREATE OR REPLACE FUNCTION update_matrimony_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_matrimony_profiles_timestamp
  BEFORE UPDATE ON matrimony_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_matrimony_updated_at();

CREATE TRIGGER update_matrimony_photos_timestamp
  BEFORE UPDATE ON matrimony_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_matrimony_updated_at();

CREATE TRIGGER update_matrimony_personal_timestamp
  BEFORE UPDATE ON matrimony_personal_details
  FOR EACH ROW
  EXECUTE FUNCTION update_matrimony_updated_at();

CREATE TRIGGER update_matrimony_career_timestamp
  BEFORE UPDATE ON matrimony_career_education
  FOR EACH ROW
  EXECUTE FUNCTION update_matrimony_updated_at();

CREATE TRIGGER update_matrimony_family_timestamp
  BEFORE UPDATE ON matrimony_family_info
  FOR EACH ROW
  EXECUTE FUNCTION update_matrimony_updated_at();

CREATE TRIGGER update_matrimony_cultural_timestamp
  BEFORE UPDATE ON matrimony_cultural_details
  FOR EACH ROW
  EXECUTE FUNCTION update_matrimony_updated_at();

CREATE TRIGGER update_matrimony_bio_timestamp
  BEFORE UPDATE ON matrimony_bio
  FOR EACH ROW
  EXECUTE FUNCTION update_matrimony_updated_at();

CREATE TRIGGER update_matrimony_preferences_timestamp
  BEFORE UPDATE ON matrimony_partner_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_matrimony_updated_at();

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE matrimony_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_career_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_family_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_cultural_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_bio ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_partner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrimony_preference_details ENABLE ROW LEVEL SECURITY;

-- Matrimony Profiles Policies
CREATE POLICY "Users can view own matrimony profile"
  ON matrimony_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own matrimony profile"
  ON matrimony_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matrimony profile"
  ON matrimony_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Matrimony Photos Policies
CREATE POLICY "Users can view own matrimony photos"
  ON matrimony_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own matrimony photos"
  ON matrimony_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matrimony photos"
  ON matrimony_photos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own matrimony photos"
  ON matrimony_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Personal Details Policies
CREATE POLICY "Users can view own personal details"
  ON matrimony_personal_details FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal details"
  ON matrimony_personal_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal details"
  ON matrimony_personal_details FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Career Education Policies
CREATE POLICY "Users can view own career education"
  ON matrimony_career_education FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own career education"
  ON matrimony_career_education FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own career education"
  ON matrimony_career_education FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Family Info Policies
CREATE POLICY "Users can view own family info"
  ON matrimony_family_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family info"
  ON matrimony_family_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family info"
  ON matrimony_family_info FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cultural Details Policies
CREATE POLICY "Users can view own cultural details"
  ON matrimony_cultural_details FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cultural details"
  ON matrimony_cultural_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cultural details"
  ON matrimony_cultural_details FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bio Policies
CREATE POLICY "Users can view own bio"
  ON matrimony_bio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bio"
  ON matrimony_bio FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bio"
  ON matrimony_bio FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Partner Preferences Policies
CREATE POLICY "Users can view own partner preferences"
  ON matrimony_partner_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own partner preferences"
  ON matrimony_partner_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own partner preferences"
  ON matrimony_partner_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Preference Details Policies
CREATE POLICY "Users can view own preference details"
  ON matrimony_preference_details FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preference details"
  ON matrimony_preference_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preference details"
  ON matrimony_preference_details FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 12. STORAGE BUCKETS
-- ============================================
-- You need to create these buckets manually in Supabase Dashboard:
-- Bucket name: 'matrimony-photos' (PUBLIC)

-- ============================================
-- 13. HELPER FUNCTIONS
-- ============================================

-- Function to get complete matrimony profile
CREATE OR REPLACE FUNCTION get_complete_matrimony_profile(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(mp.*) FROM matrimony_profiles mp WHERE mp.user_id = p_user_id),
    'photos', (SELECT json_agg(row_to_json(mph.*)) FROM matrimony_photos mph WHERE mph.user_id = p_user_id ORDER BY display_order),
    'personal', (SELECT row_to_json(mpd.*) FROM matrimony_personal_details mpd WHERE mpd.user_id = p_user_id),
    'career', (SELECT row_to_json(mce.*) FROM matrimony_career_education mce WHERE mce.user_id = p_user_id),
    'family', (SELECT row_to_json(mfi.*) FROM matrimony_family_info mfi WHERE mfi.user_id = p_user_id),
    'cultural', (SELECT row_to_json(mcd.*) FROM matrimony_cultural_details mcd WHERE mcd.user_id = p_user_id),
    'bio', (SELECT row_to_json(mb.*) FROM matrimony_bio mb WHERE mb.user_id = p_user_id),
    'preferences', (SELECT row_to_json(mpp.*) FROM matrimony_partner_preferences mpp WHERE mpp.user_id = p_user_id),
    'preference_details', (SELECT json_agg(row_to_json(mpd.*)) FROM matrimony_preference_details mpd WHERE mpd.user_id = p_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check profile completion status
CREATE OR REPLACE FUNCTION get_matrimony_profile_completion(p_user_id UUID)
RETURNS TABLE(
  has_profile BOOLEAN,
  step1_completed BOOLEAN,
  step2_completed BOOLEAN,
  step3_completed BOOLEAN,
  step4_completed BOOLEAN,
  step5_completed BOOLEAN,
  step6_completed BOOLEAN,
  step7_completed BOOLEAN,
  profile_completed BOOLEAN,
  completion_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXISTS(SELECT 1 FROM matrimony_profiles WHERE user_id = p_user_id) AS has_profile,
    COALESCE(mp.step1_completed, FALSE) AS step1_completed,
    COALESCE(mp.step2_completed, FALSE) AS step2_completed,
    COALESCE(mp.step3_completed, FALSE) AS step3_completed,
    COALESCE(mp.step4_completed, FALSE) AS step4_completed,
    COALESCE(mp.step5_completed, FALSE) AS step5_completed,
    COALESCE(mp.step6_completed, FALSE) AS step6_completed,
    COALESCE(mp.step7_completed, FALSE) AS step7_completed,
    COALESCE(mp.profile_completed, FALSE) AS profile_completed,
    CASE
      WHEN mp.profile_completed THEN 100
      WHEN mp.step7_completed THEN 95
      WHEN mp.step6_completed THEN 85
      WHEN mp.step5_completed THEN 71
      WHEN mp.step4_completed THEN 57
      WHEN mp.step3_completed THEN 43
      WHEN mp.step2_completed THEN 29
      WHEN mp.step1_completed THEN 14
      ELSE 0
    END AS completion_percentage
  FROM matrimony_profiles mp
  WHERE mp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE! Run this entire script in Supabase SQL Editor
-- ============================================

