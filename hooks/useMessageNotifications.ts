'use client'

import { useEffect, useRef } from 'react'
import { useSocket } from './useSocket'
import { useToast } from './use-toast'
import { supabase } from '@/lib/supabaseClient'
import type { Message } from '@/lib/types'

interface UseMessageNotificationsOptions {
  currentMatchId?: string | null
  currentPage?: 'chat' | 'messages' | 'other'
  onInPageNotification?: (message: Message, senderName: string) => void
}

export function useMessageNotifications(options: UseMessageNotificationsOptions = {}) {
  const { currentMatchId, currentPage = 'other', onInPageNotification } = options
  const { toast } = useToast()
  const currentUserIdRef = useRef<string | null>(null)
  const senderNamesCache = useRef<Map<string, string>>(new Map())

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        currentUserIdRef.current = user.id
      }
    }
    getCurrentUser()
  }, [])

  // Fetch sender name from cache or database
  const getSenderName = async (senderId: string): Promise<string> => {
    // Check cache first
    if (senderNamesCache.current.has(senderId)) {
      return senderNamesCache.current.get(senderId)!
    }

    try {
      // Try dating profile first
      let { data: datingProfile } = await supabase
        .from('dating_profile_full')
        .select('name')
        .eq('user_id', senderId)
        .single()

      if (datingProfile?.name) {
        senderNamesCache.current.set(senderId, datingProfile.name)
        return datingProfile.name
      }

      // Try matrimony profile
      const { data: matrimonyProfile } = await supabase
        .from('matrimony_profile_full')
        .select('name')
        .eq('user_id', senderId)
        .single()

      if (matrimonyProfile?.name) {
        senderNamesCache.current.set(senderId, matrimonyProfile.name)
        return matrimonyProfile.name
      }

      return 'Unknown User'
    } catch (error) {
      console.error('Error fetching sender name:', error)
      return 'Unknown User'
    }
  }

  // Handle incoming messages
  const handleMessage = async (message: Message) => {
    // Don't show notification for messages sent by current user
    if (message.sender_id === currentUserIdRef.current) {
      return
    }

    // Get sender name
    const senderName = await getSenderName(message.sender_id)

    // Check if user is on the chat page for this specific match
    const isOnCurrentChat = currentPage === 'chat' && currentMatchId === message.match_id

    if (isOnCurrentChat) {
      // Show in-page notification
      if (onInPageNotification) {
        onInPageNotification(message, senderName)
      }
    } else {
      // Show toast notification
      toast({
        title: 'New Message',
        description: `New message from ${senderName}`,
        duration: 5000,
      })
    }
  }

  // Set up socket listener
  useSocket({
    onMessage: handleMessage,
    onError: (error) => {
      console.error('Socket error in notifications:', error)
    },
  })

  return {
    // Expose any utility functions if needed
  }
}

