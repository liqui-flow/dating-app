import { supabase } from './supabaseClient'
import type { Message } from './types'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Get match_id from user IDs and match type
 */
export async function getMatchId(
  userId: string,
  otherUserId: string,
  matchType: 'dating' | 'matrimony'
): Promise<string | null> {
  try {
    const tableName = matchType === 'dating' ? 'dating_matches' : 'matrimony_matches'
    
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .eq('is_active', true)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .or(`user1_id.eq.${otherUserId},user2_id.eq.${otherUserId}`)
      .single()

    if (error) {
      console.error('[getMatchId] Error:', error)
      return null
    }

    // Verify both users are in the match
    const { data: matchData, error: matchError } = await supabase
      .from(tableName)
      .select('user1_id, user2_id')
      .eq('id', data.id)
      .single()

    if (matchError || !matchData) {
      console.error('[getMatchId] Match verification error:', matchError)
      return null
    }

    const isUser1 = matchData.user1_id === userId || matchData.user1_id === otherUserId
    const isUser2 = matchData.user2_id === userId || matchData.user2_id === otherUserId

    if (isUser1 && isUser2) {
      return data.id
    }

    return null
  } catch (error: any) {
    console.error('[getMatchId] Exception:', error)
    return null
  }
}

/**
 * Get match_id from user IDs (tries both dating and matrimony)
 */
export async function getMatchIdAuto(
  userId: string,
  otherUserId: string
): Promise<{ matchId: string; matchType: 'dating' | 'matrimony' } | null> {
  // Try dating first
  const datingMatchId = await getMatchId(userId, otherUserId, 'dating')
  if (datingMatchId) {
    return { matchId: datingMatchId, matchType: 'dating' }
  }

  // Try matrimony
  const matrimonyMatchId = await getMatchId(userId, otherUserId, 'matrimony')
  if (matrimonyMatchId) {
    return { matchId: matrimonyMatchId, matchType: 'matrimony' }
  }

  return null
}

/**
 * Load message history for a match
 */
export async function getMessages(
  matchId: string,
  userId: string
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[getMessages] Error:', error)
      return []
    }

    return (data || []) as Message[]
  } catch (error: any) {
    console.error('[getMessages] Exception:', error)
    return []
  }
}

/**
 * Send a new message
 */
export async function sendMessage(
  matchId: string,
  senderId: string,
  receiverId: string,
  content: string,
  matchType: 'dating' | 'matrimony'
): Promise<Message | null> {
  try {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty')
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
        match_type: matchType,
      })
      .select()
      .single()

    if (error) {
      console.error('[sendMessage] Error:', error)
      throw error
    }

    return data as Message
  } catch (error: any) {
    console.error('[sendMessage] Exception:', error)
    throw error
  }
}

/**
 * Mark a message as delivered
 */
export async function markDelivered(messageId: string, userId: string): Promise<boolean> {
  try {
    // First verify the user is the receiver
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('receiver_id, delivered_at')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      console.error('[markDelivered] Message not found:', fetchError)
      return false
    }

    if (message.receiver_id !== userId) {
      console.error('[markDelivered] User is not the receiver')
      return false
    }

    // Only update if not already delivered
    if (message.delivered_at) {
      return true
    }

    const { error } = await supabase
      .from('messages')
      .update({ delivered_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('receiver_id', userId)

    if (error) {
      console.error('[markDelivered] Error:', error)
      return false
    }

    return true
  } catch (error: any) {
    console.error('[markDelivered] Exception:', error)
    return false
  }
}

/**
 * Mark all messages in a match as seen
 */
export async function markSeen(matchId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ seen_at: new Date().toISOString() })
      .eq('match_id', matchId)
      .eq('receiver_id', userId)
      .is('seen_at', null)

    if (error) {
      console.error('[markSeen] Error:', error)
      return false
    }

    return true
  } catch (error: any) {
    console.error('[markSeen] Exception:', error)
    return false
  }
}

/**
 * Subscribe to real-time message updates for a match
 */
export function subscribeToMessages(
  matchId: string,
  callbacks: {
    onInsert?: (message: Message) => void
    onUpdate?: (message: Message) => void
    onError?: (error: Error) => void
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        if (callbacks.onInsert) {
          callbacks.onInsert(payload.new as Message)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        if (callbacks.onUpdate) {
          callbacks.onUpdate(payload.new as Message)
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[subscribeToMessages] Subscribed to match:', matchId)
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[subscribeToMessages] Channel error for match:', matchId)
        if (callbacks.onError) {
          callbacks.onError(new Error('Channel subscription error'))
        }
      }
    })

  return channel
}

/**
 * Get the last message for a match
 */
export async function getLastMessage(matchId: string): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No messages found
        return null
      }
      console.error('[getLastMessage] Error:', error)
      return null
    }

    return data as Message
  } catch (error: any) {
    console.error('[getLastMessage] Exception:', error)
    return null
  }
}

/**
 * Get unread message count for a match
 */
export async function getUnreadCount(matchId: string, userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', matchId)
      .eq('receiver_id', userId)
      .is('seen_at', null)

    if (error) {
      console.error('[getUnreadCount] Error:', error)
      return 0
    }

    return count || 0
  } catch (error: any) {
    console.error('[getUnreadCount] Exception:', error)
    return 0
  }
}

/**
 * Get total unread message count across all conversations for a user
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .is('seen_at', null)

    if (error) {
      console.error('[getTotalUnreadCount] Error:', error)
      return 0
    }

    return count || 0
  } catch (error: any) {
    console.error('[getTotalUnreadCount] Exception:', error)
    return 0
  }
}

