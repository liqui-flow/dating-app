-- ============================================
-- RECREATE VERIFICATION PROGRESS TABLE
-- Run this in your Supabase SQL Editor if you accidentally deleted the table
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CREATE VERIFICATION_PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_progress_user_id ON verification_progress(user_id);

-- ============================================
-- CREATE UPDATE TIMESTAMP TRIGGER FUNCTION (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verification_progress table
DROP TRIGGER IF EXISTS update_verification_progress_updated_at ON verification_progress;
CREATE TRIGGER update_verification_progress_updated_at
  BEFORE UPDATE ON verification_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE verification_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own verification progress" ON verification_progress;
DROP POLICY IF EXISTS "Users can insert their own verification progress" ON verification_progress;
DROP POLICY IF EXISTS "Users can update their own verification progress" ON verification_progress;

-- Policy: Users can view their own verification progress
CREATE POLICY "Users can view their own verification progress"
  ON verification_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own verification progress
CREATE POLICY "Users can insert their own verification progress"
  ON verification_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own verification progress
CREATE POLICY "Users can update their own verification progress"
  ON verification_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================
-- The verification_progress table has been recreated successfully!
-- You can now use the verification flow again.

