-- ============================================
-- ADD PATH COLUMN TO USER PROFILES
-- ============================================

-- Add path column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS path VARCHAR(20) CHECK (path IN ('dating', 'matrimony'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_path ON user_profiles(path);

-- Add path selection timestamp
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS path_selected_at TIMESTAMP WITH TIME ZONE;

-- Comment for documentation
COMMENT ON COLUMN user_profiles.path IS 'User selected path: dating or matrimony';

