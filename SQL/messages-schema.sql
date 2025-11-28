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
  reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  deleted_by TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  delivered_at TIMESTAMP WITH TIME ZONE,
  seen_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'seen')),
  delivered_to UUID[] NOT NULL DEFAULT '{}'::uuid[],
  seen_by UUID[] NOT NULL DEFAULT '{}'::uuid[],
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
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_message_id);

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
-- 3. RPC HELPERS FOR DELIVERY / READ STATUS
-- ============================================

CREATE OR REPLACE FUNCTION mark_message_delivered(p_message_id UUID, p_user_id UUID)
RETURNS messages AS $$
DECLARE
  v_message messages;
BEGIN
  UPDATE messages
    SET delivered_at = COALESCE(delivered_at, TIMEZONE('utc', NOW())),
        delivered_to = (
          SELECT ARRAY(
            SELECT DISTINCT uid FROM unnest(delivered_to || ARRAY[p_user_id]) AS uid
          )
        ),
        status = CASE WHEN status = 'sent' THEN 'delivered' ELSE status END
  WHERE id = p_message_id
    AND receiver_id = p_user_id
  RETURNING * INTO v_message;

  RETURN v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION mark_message_seen(p_message_id UUID, p_user_id UUID)
RETURNS messages AS $$
DECLARE
  v_message messages;
BEGIN
  UPDATE messages
    SET seen_at = COALESCE(seen_at, TIMEZONE('utc', NOW())),
        seen_by = (
          SELECT ARRAY(
            SELECT DISTINCT uid FROM unnest(seen_by || ARRAY[p_user_id]) AS uid
          )
        ),
        delivered_at = COALESCE(delivered_at, TIMEZONE('utc', NOW())),
        delivered_to = (
          SELECT ARRAY(
            SELECT DISTINCT uid FROM unnest(delivered_to || ARRAY[p_user_id]) AS uid
          )
        ),
        status = 'seen'
  WHERE id = p_message_id
    AND receiver_id = p_user_id
  RETURNING * INTO v_message;

  RETURN v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION mark_message_delivered(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_message_seen(UUID, UUID) TO authenticated;

-- ============================================
-- DONE! ✅
-- ============================================

