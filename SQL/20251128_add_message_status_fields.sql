-- ============================================
-- Migration: Message status fields & RPC helpers
-- ============================================

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'seen')),
  ADD COLUMN IF NOT EXISTS delivered_to UUID[] NOT NULL DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS seen_by UUID[] NOT NULL DEFAULT '{}'::uuid[];

-- Backfill derived columns for existing data
UPDATE messages
SET
  status = CASE
    WHEN seen_at IS NOT NULL THEN 'seen'
    WHEN delivered_at IS NOT NULL THEN 'delivered'
    ELSE 'sent'
  END,
  delivered_to = CASE
    WHEN delivered_at IS NOT NULL THEN ARRAY[receiver_id]::uuid[]
    ELSE delivered_to
  END,
  seen_by = CASE
    WHEN seen_at IS NOT NULL THEN ARRAY[receiver_id]::uuid[]
    ELSE seen_by
  END
WHERE TRUE;

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

