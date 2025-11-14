-- ============================================
-- ADD MISSING BIO COLUMN TO DATING_PROFILE_FULL
-- Run this if you get "column bio does not exist" error
-- ============================================

-- Add bio column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'dating_profile_full' 
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE dating_profile_full ADD COLUMN bio TEXT;
    RAISE NOTICE 'Added bio column to dating_profile_full';
  ELSE
    RAISE NOTICE 'bio column already exists in dating_profile_full';
  END IF;
END $$;

