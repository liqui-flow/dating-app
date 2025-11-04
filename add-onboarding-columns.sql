-- ============================================
-- ADD ONBOARDING REDIRECT COLUMNS TO USER PROFILES
-- Adds selected_path and onboarding_completed columns
-- ============================================

-- Add selected_path column (if path doesn't exist, or add as new column)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS selected_path VARCHAR(20) CHECK (selected_path IN ('dating', 'matrimony'));

-- Add onboarding_completed column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add timestamps for tracking
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_selected_path ON user_profiles(selected_path);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed ON user_profiles(onboarding_completed);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.selected_path IS 'User selected path: dating or matrimony';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user has completed the onboarding process';

-- If you have existing data in the 'path' column, migrate it to 'selected_path'
-- Uncomment the following line if needed:
-- UPDATE user_profiles SET selected_path = path WHERE path IS NOT NULL AND selected_path IS NULL;

