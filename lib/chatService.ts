import { supabase } from './supabaseClient'
import type { Message, MessageMedia, MessageWithMedia } from './types'
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
  userId: string,
  matchType: 'dating' | 'matrimony'
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .eq('match_type', matchType)
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
  matchType: 'dating' | 'matrimony',
  allowEmpty: boolean = false
): Promise<Message | null> {
  try {
    if (!allowEmpty && !content.trim()) {
      throw new Error('Message content cannot be empty')
    }

    // Use empty string if content is empty (for media-only messages)
    // The database should allow empty content after running the fix script
    const messageContent = allowEmpty && !content.trim() ? '' : content.trim()

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: messageContent,
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
export async function markDelivered(messageId: string, userId: string, matchType: 'dating' | 'matrimony'): Promise<boolean> {
  try {
    // First verify the user is the receiver and message type matches
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('receiver_id, delivered_at, match_type')
      .eq('id', messageId)
      .eq('match_type', matchType)
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
      .eq('match_type', matchType)

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
export async function markSeen(matchId: string, userId: string, matchType: 'dating' | 'matrimony'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ seen_at: new Date().toISOString() })
      .eq('match_id', matchId)
      .eq('match_type', matchType)
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
  matchType: 'dating' | 'matrimony',
  callbacks: {
    onInsert?: (message: Message) => void
    onUpdate?: (message: Message) => void
    onError?: (error: Error) => void
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${matchId}:${matchType}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}&match_type=eq.${matchType}`,
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
        filter: `match_id=eq.${matchId}&match_type=eq.${matchType}`,
      },
      (payload) => {
        if (callbacks.onUpdate) {
          callbacks.onUpdate(payload.new as Message)
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[subscribeToMessages] Subscribed to match:', matchId, 'type:', matchType)
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[subscribeToMessages] Channel error for match:', matchId, 'type:', matchType)
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
export async function getLastMessage(matchId: string, matchType: 'dating' | 'matrimony'): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .eq('match_type', matchType)
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
export async function getUnreadCount(matchId: string, userId: string, matchType: 'dating' | 'matrimony'): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', matchId)
      .eq('match_type', matchType)
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

/**
 * Upload chat media files to Supabase Storage
 */
export async function uploadChatMedia(
  matchId: string,
  messageId: string,
  userId: string,
  files: File[]
): Promise<{ url: string; fileName: string; fileSize: number; mediaType: 'image' | 'video' }[]> {
  try {
    const uploadResults: { url: string; fileName: string; fileSize: number; mediaType: 'image' | 'video' }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop() || ''
      const timestamp = Date.now()
      const fileName = `${matchId}/${messageId}/${userId}/${timestamp}-${i}.${fileExt}`
      
      // Determine media type
      const mediaType: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 'video'

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('[uploadChatMedia] Upload error:', uploadError)
        
        // Provide more helpful error messages
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('does not exist')) {
          throw new Error('Chat media bucket not found. Please create the "chat-media" bucket in Supabase Storage and apply the storage policies.')
        } else if (uploadError.message.includes('new row violates row-level security policy') || uploadError.message.includes('policy')) {
          throw new Error('Storage policy error. Please ensure the storage policies from storage-policies.sql have been applied.')
        } else {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }
      }

      // For private buckets, store the file path
      // Signed URLs will be generated when retrieving media
      // This is better than storing signed URLs which expire
      uploadResults.push({
        url: fileName, // Store the storage path, not a URL
        fileName: file.name,
        fileSize: file.size,
        mediaType,
      })
    }

    return uploadResults
  } catch (error: any) {
    console.error('[uploadChatMedia] Exception:', error)
    throw error
  }
}

/**
 * Get signed URL for chat media (required for private buckets)
 * Handles both file paths and existing URLs
 */
async function getChatMediaSignedUrl(mediaUrl: string): Promise<string> {
  try {
    let storagePath = mediaUrl
    
    // Extract the path from various URL formats
    if (mediaUrl.includes('/storage/v1/object/public/chat-media/')) {
      // Public URL format: extract path after bucket name
      storagePath = mediaUrl.split('/storage/v1/object/public/chat-media/')[1].split('?')[0]
    } else if (mediaUrl.includes('/storage/v1/object/sign/chat-media/')) {
      // Signed URL format: extract path before query params
      const pathMatch = mediaUrl.match(/\/storage\/v1\/object\/sign\/chat-media\/([^?]+)/)
      if (pathMatch) {
        storagePath = pathMatch[1]
      } else {
        // Can't extract path, try to use as-is (might still work if not expired)
        return mediaUrl
      }
    } else if (mediaUrl.includes('chat-media/')) {
      // Direct path reference with bucket name
      storagePath = mediaUrl.split('chat-media/')[1].split('?')[0]
    } else if (!mediaUrl.startsWith('http')) {
      // Assume it's already a storage path (format: match_id/message_id/user_id/filename)
      storagePath = mediaUrl
    } else {
      // Unknown format, return as-is
      console.warn('[getChatMediaSignedUrl] Unknown URL format:', mediaUrl)
      return mediaUrl
    }

    // Decode URL-encoded path if needed
    try {
      storagePath = decodeURIComponent(storagePath)
    } catch (e) {
      // If decoding fails, use original
    }

    // Get signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('chat-media')
      .createSignedUrl(storagePath, 3600) // 1 hour expiry

    if (error) {
      console.error('[getChatMediaSignedUrl] Error creating signed URL:', error, 'for path:', storagePath, 'original URL:', mediaUrl)
      // Fallback to original URL if signed URL fails
      return mediaUrl
    }

    return data.signedUrl
  } catch (error: any) {
    console.error('[getChatMediaSignedUrl] Exception:', error, 'for URL:', mediaUrl)
    return mediaUrl
  }
}

/**
 * Get media for a specific message with signed URLs
 */
export async function getMessageMedia(messageId: string): Promise<MessageMedia[]> {
  try {
    const { data, error } = await supabase
      .from('message_media')
      .select('*')
      .eq('message_id', messageId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[getMessageMedia] Error:', error)
      return []
    }

    // Convert media URLs to signed URLs for private bucket access
    const mediaWithSignedUrls = await Promise.all(
      (data || []).map(async (media: MessageMedia) => {
        const signedUrl = await getChatMediaSignedUrl(media.media_url)
        return {
          ...media,
          media_url: signedUrl,
        }
      })
    )

    return mediaWithSignedUrls as MessageMedia[]
  } catch (error: any) {
    console.error('[getMessageMedia] Exception:', error)
    return []
  }
}

/**
 * Get media for multiple messages with signed URLs
 */
export async function getMessagesMedia(messageIds: string[]): Promise<Record<string, MessageMedia[]>> {
  try {
    if (messageIds.length === 0) return {}

    const { data, error } = await supabase
      .from('message_media')
      .select('*')
      .in('message_id', messageIds)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[getMessagesMedia] Error:', error)
      return {}
    }

    // Convert media URLs to signed URLs for private bucket access
    const mediaWithSignedUrls = await Promise.all(
      (data || []).map(async (media: MessageMedia) => {
        const signedUrl = await getChatMediaSignedUrl(media.media_url)
        return {
          ...media,
          media_url: signedUrl,
        }
      })
    )

    // Group by message_id
    const mediaMap: Record<string, MessageMedia[]> = {}
    for (const media of mediaWithSignedUrls) {
      if (!mediaMap[media.message_id]) {
        mediaMap[media.message_id] = []
      }
      mediaMap[media.message_id].push(media)
    }

    return mediaMap
  } catch (error: any) {
    console.error('[getMessagesMedia] Exception:', error)
    return {}
  }
}

/**
 * Save message media to database
 */
export async function saveMessageMedia(
  messageId: string,
  mediaFiles: { url: string; fileName: string; fileSize: number; mediaType: 'image' | 'video' }[]
): Promise<MessageMedia[]> {
  try {
    const mediaRecords = mediaFiles.map((file, index) => ({
      message_id: messageId,
      media_url: file.url,
      media_type: file.mediaType,
      file_name: file.fileName,
      file_size: file.fileSize,
      display_order: index,
    }))

    const { data, error } = await supabase
      .from('message_media')
      .insert(mediaRecords)
      .select()

    if (error) {
      console.error('[saveMessageMedia] Error:', error)
      throw error
    }

    return (data || []) as MessageMedia[]
  } catch (error: any) {
    console.error('[saveMessageMedia] Exception:', error)
    throw error
  }
}

/**
 * Send a message with media files
 */
export async function sendMessageWithMedia(
  matchId: string,
  senderId: string,
  receiverId: string,
  content: string,
  matchType: 'dating' | 'matrimony',
  mediaFiles: File[]
): Promise<MessageWithMedia | null> {
  try {
    // First, create the message (content can be empty if only media)
    const message = await sendMessage(matchId, senderId, receiverId, content || '', matchType, true)
    
    if (!message) {
      throw new Error('Failed to create message')
    }

    // If no media files, return message as-is
    if (!mediaFiles || mediaFiles.length === 0) {
      return { ...message, media: [] }
    }

    // Upload media files
    const uploadedMedia = await uploadChatMedia(matchId, message.id, senderId, mediaFiles)

    // Save media records to database
    const savedMedia = await saveMessageMedia(message.id, uploadedMedia)

    return {
      ...message,
      media: savedMedia,
    }
  } catch (error: any) {
    console.error('[sendMessageWithMedia] Exception:', error)
    throw error
  }
}

