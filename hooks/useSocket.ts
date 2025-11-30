'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSocketContext } from '@/contexts/SocketContext'
import type { Message } from '@/lib/types'

interface UseSocketOptions {
  onMessage?: (message: Message) => void
  onError?: (error: Error) => void
  onTyping?: (data: { matchId: string; userId: string; isTyping: boolean }) => void
}

export function useSocket(options: UseSocketOptions = {}) {
  const { socket, isConnected } = useSocketContext()
  const { onMessage, onError, onTyping } = options
  const receivedMessageIds = useRef<Set<string>>(new Set())
  const joinedRooms = useRef<Set<string>>(new Set())

  // Join a conversation room
  const joinConversation = useCallback(
    (matchId: string) => {
      if (!socket || !isConnected) {
        console.warn('Socket not connected, cannot join conversation')
        return
      }

      if (joinedRooms.current.has(matchId)) {
        console.log(`Already joined conversation: ${matchId}`)
        return
      }

      socket.emit('join_conversation', { matchId })
      joinedRooms.current.add(matchId)
      console.log(`Joined conversation: ${matchId}`)
    },
    [socket, isConnected]
  )

  // Leave a conversation room
  const leaveConversation = useCallback(
    (matchId: string) => {
      if (!socket || !isConnected) {
        return
      }

      if (!joinedRooms.current.has(matchId)) {
        return
      }

      socket.emit('leave_conversation', { matchId })
      joinedRooms.current.delete(matchId)
      console.log(`Left conversation: ${matchId}`)
    },
    [socket, isConnected]
  )

  // Send a message via Socket.io
  const sendMessageSocket = useCallback(
    (matchId: string, receiverId: string, message: Message) => {
      if (!socket || !isConnected) {
        console.warn('Socket not connected, cannot send message')
        return false
      }

      socket.emit('send_message', {
        matchId,
        receiverId,
        message,
      })

      return true
    },
    [socket, isConnected]
  )

  // Send typing indicator
  const sendTyping = useCallback(
    (matchId: string, receiverId: string, isTyping: boolean) => {
      if (!socket || !isConnected) {
        return false
      }

      socket.emit('typing', {
        matchId,
        receiverId,
        isTyping,
      })

      return true
    },
    [socket, isConnected]
  )

  // Listen for incoming messages
  useEffect(() => {
    if (!socket || !isConnected) {
      return
    }

    const handleReceiveMessage = (data: {
      matchId: string
      senderId: string
      message: Message
      timestamp: string
    }) => {
      const { message } = data

      // Prevent duplicate messages
      if (receivedMessageIds.current.has(message.id)) {
        console.log(`Duplicate message ignored: ${message.id}`)
        return
      }

      // Mark message as received
      receivedMessageIds.current.add(message.id)

      // Call the callback
      if (onMessage) {
        onMessage(message)
      }
    }

    const handleError = (error: { message: string }) => {
      if (onError) {
        onError(new Error(error.message))
      }
    }

    const handleTyping = (data: { matchId: string; userId: string; isTyping: boolean }) => {
      if (onTyping) {
        onTyping(data)
      }
    }

    socket.on('receive_message', handleReceiveMessage)
    socket.on('error', handleError)
    socket.on('typing', handleTyping)

    return () => {
      socket.off('receive_message', handleReceiveMessage)
      socket.off('error', handleError)
      socket.off('typing', handleTyping)
    }
  }, [socket, isConnected, onMessage, onError, onTyping])

  // Clean up received message IDs periodically to prevent memory leaks
  useEffect(() => {
    const interval = setInterval(() => {
      // Keep only the last 1000 message IDs
      if (receivedMessageIds.current.size > 1000) {
        const idsArray = Array.from(receivedMessageIds.current)
        receivedMessageIds.current = new Set(idsArray.slice(-1000))
      }
    }, 60000) // Clean up every minute

    return () => clearInterval(interval)
  }, [])

  return {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessageSocket,
    sendTyping,
  }
}

