-- ============================================
-- MIGRATION: Add latitude/longitude to dating_profile_full
-- ============================================

-- Enable required extensions (safe to re-run)
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

ALTER TABLE dating_profile_full
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create a GIST index for efficient distance queries
CREATE INDEX IF NOT EXISTS idx_dating_profile_location
ON dating_profile_full
USING GIST (ll_to_earth(latitude, longitude));

