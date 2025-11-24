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
-- 2. MESSAGE_MEDIA TABLE
-- Stores media files (images/videos) associated with messages
-- ============================================
CREATE TABLE IF NOT EXISTS message_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT positive_file_size CHECK (file_size > 0),
  CONSTRAINT non_negative_display_order CHECK (display_order >= 0)
);

-- Indexes for message_media
CREATE INDEX IF NOT EXISTS idx_message_media_message_id ON message_media(message_id);
CREATE INDEX IF NOT EXISTS idx_message_media_display_order ON message_media(message_id, display_order);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can update own sent messages" ON messages;
DROP POLICY IF EXISTS "Users can view media in their messages" ON message_media;
DROP POLICY IF EXISTS "Users can insert media for their messages" ON message_media;

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

-- Message Media Policies
-- Users can view media for messages they can see
CREATE POLICY "Users can view media in their messages"
  ON message_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_media.message_id AND
            (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
    )
  );

-- Users can insert media for messages they sent
CREATE POLICY "Users can insert media for their messages"
  ON message_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_media.message_id AND
            messages.sender_id = auth.uid()
    )
  );

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to get messages with media
CREATE OR REPLACE FUNCTION get_messages_with_media(
  p_match_id UUID,
  p_user_id UUID,
  p_match_type VARCHAR
)
RETURNS TABLE (
  message_id UUID,
  match_id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  seen_at TIMESTAMP WITH TIME ZONE,
  match_type VARCHAR,
  media_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as message_id,
    m.match_id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.created_at,
    m.delivered_at,
    m.seen_at,
    m.match_type,
    COUNT(mm.id) as media_count
  FROM messages m
  LEFT JOIN message_media mm ON m.id = mm.message_id
  WHERE m.match_id = p_match_id
    AND m.match_type = p_match_type
    AND (m.sender_id = p_user_id OR m.receiver_id = p_user_id)
  GROUP BY m.id, m.match_id, m.sender_id, m.receiver_id, m.content, 
           m.created_at, m.delivered_at, m.seen_at, m.match_type
  ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE! ✅
-- ============================================

