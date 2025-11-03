-- ============================================
-- LOVESATHI DATABASE SCHEMA
-- User Verification Tables
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- Stores basic user information including DOB and Gender
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_user_profile UNIQUE (user_id),
  CONSTRAINT valid_age CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '17 years')
);

-- Create index for faster queries
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_gender ON user_profiles(gender);
CREATE INDEX idx_user_profiles_dob ON user_profiles(date_of_birth);

-- ============================================
-- 2. ID VERIFICATION TABLE
-- Stores ID verification documents and status
-- ============================================
CREATE TABLE IF NOT EXISTS id_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document Information
  document_type VARCHAR(50) CHECK (document_type IN ('aadhar', 'pan', 'driving_license', 'passport')),
  document_file_url TEXT,
  document_file_name TEXT,
  document_file_size INTEGER,
  
  -- Face Scan Information
  face_scan_url TEXT,
  face_scan_file_name TEXT,
  face_scan_file_size INTEGER,
  
  -- Verification Status
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'in_review')),
  verification_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_user_verification UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_id_verifications_user_id ON id_verifications(user_id);
CREATE INDEX idx_id_verifications_status ON id_verifications(verification_status);

-- ============================================
-- 3. VERIFICATION STEPS TRACKING
-- Tracks which verification steps user has completed
-- ============================================
CREATE TABLE IF NOT EXISTS verification_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Step completion flags
  dob_completed BOOLEAN DEFAULT FALSE,
  dob_completed_at TIMESTAMP WITH TIME ZONE,
  
  gender_completed BOOLEAN DEFAULT FALSE,
  gender_completed_at TIMESTAMP WITH TIME ZONE,
  
  id_verification_completed BOOLEAN DEFAULT FALSE,
  id_verification_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Overall completion
  all_steps_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT unique_user_progress UNIQUE (user_id)
);

-- Create index
CREATE INDEX idx_verification_progress_user_id ON verification_progress(user_id);

-- ============================================
-- 4. UPDATE TIMESTAMP TRIGGER FUNCTION
-- Automatically updates the updated_at column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_id_verifications_updated_at
  BEFORE UPDATE ON id_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_progress_updated_at
  BEFORE UPDATE ON verification_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_progress ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ID Verifications Policies
CREATE POLICY "Users can view own verification"
  ON id_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification"
  ON id_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification"
  ON id_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Verification Progress Policies
CREATE POLICY "Users can view own progress"
  ON verification_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON verification_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON verification_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. STORAGE BUCKETS (Run this separately in Supabase Dashboard)
-- ============================================
-- You need to create these buckets manually in Supabase Dashboard:
-- Bucket name: 'verification-documents'
-- Bucket name: 'face-scans'
-- Both should be PRIVATE (not public)

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to get user verification status
CREATE OR REPLACE FUNCTION get_user_verification_status(p_user_id UUID)
RETURNS TABLE(
  has_profile BOOLEAN,
  has_verification BOOLEAN,
  verification_status VARCHAR,
  progress_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXISTS(SELECT 1 FROM user_profiles WHERE user_id = p_user_id) AS has_profile,
    EXISTS(SELECT 1 FROM id_verifications WHERE user_id = p_user_id) AS has_verification,
    COALESCE(iv.verification_status, 'not_started')::VARCHAR AS verification_status,
    CASE
      WHEN vp.all_steps_completed THEN 100
      WHEN vp.id_verification_completed THEN 75
      WHEN vp.gender_completed THEN 50
      WHEN vp.dob_completed THEN 25
      ELSE 0
    END AS progress_percentage
  FROM verification_progress vp
  LEFT JOIN id_verifications iv ON iv.user_id = vp.user_id
  WHERE vp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment the following lines to insert sample data

-- INSERT INTO user_profiles (user_id, date_of_birth, gender)
-- VALUES 
--   ('user-uuid-here', '1995-05-15', 'male'),
--   ('user-uuid-here-2', '1998-08-20', 'female');

-- INSERT INTO verification_progress (user_id, dob_completed, gender_completed)
-- VALUES 
--   ('user-uuid-here', TRUE, TRUE);

