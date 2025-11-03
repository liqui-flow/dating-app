-- ============================================
-- CLEAN SUPABASE SETUP FOR USER VERIFICATION
-- This script will DROP existing tables and create fresh ones
-- ============================================

-- ============================================
-- STEP 1: DROP EXISTING TABLES (if any)
-- ============================================
DROP TABLE IF EXISTS verification_progress CASCADE;
DROP TABLE IF EXISTS id_verifications CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_verification_status CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- ============================================
-- STEP 2: ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 3: CREATE TABLES
-- ============================================

-- Table 1: User Profiles (DOB + Gender)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: ID Verifications (Upload File + Face Scan)
CREATE TABLE id_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Uploaded ID Document
  document_file_url TEXT,
  document_file_name TEXT,
  document_file_size INTEGER,
  
  -- Face Scan Photo
  face_scan_url TEXT,
  face_scan_file_name TEXT,
  face_scan_file_size INTEGER,
  
  -- Verification Status
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'in_review')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: Verification Progress Tracking
CREATE TABLE verification_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Step tracking
  dob_completed BOOLEAN DEFAULT FALSE,
  dob_completed_at TIMESTAMPTZ,
  
  gender_completed BOOLEAN DEFAULT FALSE,
  gender_completed_at TIMESTAMPTZ,
  
  id_verification_completed BOOLEAN DEFAULT FALSE,
  id_verification_completed_at TIMESTAMPTZ,
  
  all_steps_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: CREATE INDEXES
-- ============================================
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_id_verifications_user_id ON id_verifications(user_id);
CREATE INDEX idx_verification_progress_user_id ON verification_progress(user_id);

-- ============================================
-- STEP 5: AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- STEP 6: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_progress ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for id_verifications
CREATE POLICY "Users can view own verification"
  ON id_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification"
  ON id_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification"
  ON id_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for verification_progress
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
-- STEP 7: HELPER FUNCTION
-- ============================================
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
-- DONE! ✅
-- ============================================
-- Next Steps:
-- 1. Create Storage Buckets in Supabase Dashboard:
--    - verification-documents (PRIVATE)
--    - face-scans (PRIVATE)
-- 2. Add storage policies (see STORAGE_POLICIES.sql)
-- ============================================

