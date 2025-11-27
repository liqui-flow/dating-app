-- ============================================
-- MESSAGES SCHEMA FOR CHAT FUNCTIONALITY
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. MESSAGES TABLE
-- Stores chat messages between matched users
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  delivered_at TIMESTAMP WITH TIME ZONE,
  seen_at TIMESTAMP WITH TIME ZONE,
  match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('dating', 'matrimony')),
  
  -- Constraints
  CONSTRAINT no_self_message CHECK (sender_id != receiver_id)
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_match_type ON messages(match_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_match_type_match_id ON messages(match_type, match_id);

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can update own sent messages" ON messages;

-- Messages Policies
-- Users can view messages where they are sender or receiver
CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can send messages where they are the sender
CREATE POLICY "Users can send messages in their matches"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    -- Verify match exists and user is part of it
    EXISTS (
      SELECT 1 FROM dating_matches
      WHERE id = match_id AND match_type = 'dating' AND
            (user1_id = auth.uid() OR user2_id = auth.uid())
      UNION ALL
      SELECT 1 FROM matrimony_matches
      WHERE id = match_id AND match_type = 'matrimony' AND
            (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Users can update their own sent messages (for delivery/seen status)
CREATE POLICY "Users can update own sent messages"
  ON messages FOR UPDATE
  USING (
    auth.uid() = receiver_id OR auth.uid() = sender_id
  )
  WITH CHECK (
    auth.uid() = receiver_id OR auth.uid() = sender_id
  );

-- ============================================
-- DONE! ✅
-- ============================================

