-- ============================================
-- FIX MESSAGES CONTENT CONSTRAINT
-- This allows messages to have empty content when media is present
-- ============================================

-- Drop the existing content_not_empty constraint if it exists
ALTER TABLE messages DROP CONSTRAINT IF EXISTS content_not_empty;

-- The content column already allows empty strings (TEXT NOT NULL DEFAULT '')
-- So we don't need to add a new constraint
-- Messages can now have empty content when only media is sent

-- ============================================
-- DONE! ✅
-- ============================================

