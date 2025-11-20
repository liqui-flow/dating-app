"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Phone, Video, MoreVertical, Send, ImageIcon, Smile, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { StaticBackground } from "@/components/discovery/static-background"
import { supabase } from "@/lib/supabaseClient"
import {
  getMessages,
  sendMessage as sendMessageService,
  markDelivered,
  markSeen,
  subscribeToMessages,
} from "@/lib/chatService"
import type { Message } from "@/lib/types"
import { RealtimeChannel } from "@supabase/supabase-js"
import { useSocket } from "@/hooks/useSocket"
import { useMessageNotifications } from "@/hooks/useMessageNotifications"

interface ChatUser {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: string
  isPremium: boolean
}

interface ChatScreenProps {
  matchId?: string
  onBack?: () => void
}

export function ChatScreen({ matchId, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [chatUser, setChatUser] = useState<ChatUser | null>(null)
  const [matchType, setMatchType] = useState<'dating' | 'matrimony'>('dating')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [inPageNotification, setInPageNotification] = useState<{ message: string; senderName: string } | null>(null)

  // Socket.io integration
  const { joinConversation, leaveConversation, sendMessageSocket, isConnected } = useSocket({
    onMessage: (message: Message) => {
      // Only add message if it's for this conversation and not already present
      if (message.match_id === matchId) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === message.id)) {
            return prev
          }
          return [...prev, message]
        })

        // Mark as delivered if we're the receiver
        if (message.receiver_id === currentUserId && !message.delivered_at) {
          markDelivered(message.id, currentUserId)
        }
      }
    },
    onError: (error) => {
      console.error('Socket error in chat:', error)
    },
  })

  // In-page notification handler
  const handleInPageNotification = (message: Message, senderName: string) => {
    setInPageNotification({
      message: message.content,
      senderName,
    })
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setInPageNotification(null)
    }, 3000)
  }

  // Set up message notifications
  useMessageNotifications({
    currentMatchId: matchId,
    currentPage: 'chat',
    onInPageNotification: handleInPageNotification,
  })

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Get delivery/read status indicator
  const getStatusIndicator = (message: Message, isOwn: boolean) => {
    if (!isOwn) return null

    if (message.seen_at) {
      return (
        <div className="w-4 h-4 rounded-full flex items-center justify-center text-blue-400">
          <div className="w-2 h-2 rounded-full bg-current" />
        </div>
      )
    } else if (message.delivered_at) {
      return (
        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white/70">
          <div className="w-2 h-2 rounded-full bg-current" />
        </div>
      )
    } else {
      return (
        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white/50">
          <div className="w-2 h-2 rounded-full bg-current" />
        </div>
      )
    }
  }

  // Load match and user info
  useEffect(() => {
    async function loadMatchInfo() {
      if (!matchId) {
        setLoading(false)
        return
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        setCurrentUserId(user.id)

        // Get match info from dating_matches first
        let { data: matchData, error: matchError } = await supabase
          .from('dating_matches')
          .select('user1_id, user2_id')
          .eq('id', matchId)
          .eq('is_active', true)
          .single()

        let otherUserId: string | null = null
        let currentMatchType: 'dating' | 'matrimony' = 'dating'

        if (matchError || !matchData) {
          // Try matrimony_matches
          const { data: matrimonyMatch, error: matrimonyError } = await supabase
            .from('matrimony_matches')
            .select('user1_id, user2_id')
            .eq('id', matchId)
            .eq('is_active', true)
            .single()

          if (matrimonyError || !matrimonyMatch) {
            console.error('Match not found')
            setLoading(false)
            return
          }

          matchData = matrimonyMatch
          currentMatchType = 'matrimony'
        }

        setMatchType(currentMatchType)

        // Determine other user ID
        if (matchData.user1_id === user.id) {
          otherUserId = matchData.user2_id
        } else if (matchData.user2_id === user.id) {
          otherUserId = matchData.user1_id
        } else {
          console.error('User is not part of this match')
          setLoading(false)
          return
        }

        if (!otherUserId) {
          setLoading(false)
          return
        }

        // Get other user's profile
        const profileTable = currentMatchType === 'dating' ? 'dating_profile_full' : 'matrimony_profile_full'
        const { data: profile, error: profileError } = await supabase
          .from(profileTable)
          .select('name, photos')
          .eq('user_id', otherUserId)
          .single()

        if (profileError) {
          console.error('Error loading profile:', profileError)
        }

        setChatUser({
          id: otherUserId,
          name: profile?.name || 'Unknown',
          avatar: (profile?.photos as string[])?.[0] || '/placeholder-user.jpg',
          isOnline: false, // TODO: Implement online status
          isPremium: false, // TODO: Get premium status
        })

        // Load messages
        const loadedMessages = await getMessages(matchId, user.id)
        setMessages(loadedMessages)

        // Mark messages as seen
        await markSeen(matchId, user.id)

        // Mark received messages as delivered
        for (const msg of loadedMessages) {
          if (msg.receiver_id === user.id && !msg.delivered_at) {
            await markDelivered(msg.id, user.id)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading match info:', error)
        setLoading(false)
      }
    }

    loadMatchInfo()
  }, [matchId])

  // Set up real-time subscription (Supabase Realtime as fallback)
  useEffect(() => {
    if (!matchId || !currentUserId) return

    // Cleanup previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = subscribeToMessages(
      matchId,
      {
        onInsert: async (message: Message) => {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === message.id)) {
              return prev
            }
            return [...prev, message]
          })

          // Mark as delivered if we're the receiver
          if (message.receiver_id === currentUserId && !message.delivered_at) {
            await markDelivered(message.id, currentUserId)
          }
        },
        onUpdate: (message: Message) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === message.id ? message : m))
          )
        },
        onError: (error) => {
          console.error('Realtime subscription error:', error)
        },
      }
    )

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [matchId, currentUserId])

  // Join Socket.io conversation room
  useEffect(() => {
    if (!matchId || !isConnected) return

    joinConversation(matchId)

    return () => {
      leaveConversation(matchId)
    }
  }, [matchId, isConnected, joinConversation, leaveConversation])

  // Mark messages as seen when component is visible
  useEffect(() => {
    if (!matchId || !currentUserId) return

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markSeen(matchId, currentUserId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [matchId, currentUserId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !matchId || !currentUserId || !chatUser) return

    const messageContent = newMessage.trim()
    setNewMessage("")

    try {
      // Optimistic update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        match_id: matchId,
        sender_id: currentUserId,
        receiver_id: chatUser.id,
        content: messageContent,
        created_at: new Date().toISOString(),
        delivered_at: null,
        seen_at: null,
        match_type: matchType,
      }

      setMessages((prev) => [...prev, tempMessage])

      // Send message to database
      const sentMessage = await sendMessageService(
        matchId,
        currentUserId,
        chatUser.id,
        messageContent,
        matchType
      )

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? sentMessage : m))
      )

      // Also send via Socket.io for real-time delivery
      if (sentMessage && isConnected) {
        sendMessageSocket(matchId, chatUser.id, sentMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')))
      // Restore message text
      setNewMessage(messageContent)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen relative">
        <StaticBackground />
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!matchId || !chatUser) {
    return (
      <div className="flex flex-col h-screen relative">
        <StaticBackground />
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Chat not found</p>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen relative">
      {/* Static Background */}
      <StaticBackground />
      
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border glass-apple">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-muted/50 rounded-full" 
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chatUser.avatar || "/placeholder.svg"} alt={chatUser.name} />
                  <AvatarFallback className="text-lg">{chatUser.name[0] || "U"}</AvatarFallback>
                </Avatar>
                {chatUser.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-lg text-foreground">{chatUser.name}</h2>
                  {chatUser.isPremium && (
                    <Badge className="bg-[#4A0E0E] text-white text-xs px-2 py-0">
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${chatUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <p className="text-sm text-muted-foreground">
                    {isTyping ? "typing..." : chatUser.isOnline ? "Online now" : `Last seen ${chatUser.lastSeen || 'recently'}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-muted/50 rounded-full">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-muted/50 rounded-full">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-muted/50 rounded-full">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* In-page Notification */}
      {inPageNotification && (
        <div className="flex-shrink-0 px-4 py-2 animate-in slide-in-from-top duration-300">
          <div className="bg-primary/90 backdrop-blur-sm border border-primary/50 rounded-lg px-4 py-2 shadow-lg">
            <p className="text-sm text-white">
              <span className="font-semibold">New message from {inPageNotification.senderName}:</span>
              <span className="ml-2">{inPageNotification.message}</span>
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">It's a Match!</h3>
            <p className="text-muted-foreground text-sm">Start the conversation with {chatUser.name}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId
              return (
                <div key={message.id} className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] sm:max-w-[80%] px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl",
                        "backdrop-blur-sm border",
                        isOwn
                          ? "bg-white/20 border-white/30 text-white rounded-br-md"
                          : "bg-white/15 border-white/20 text-white rounded-bl-md",
                      )}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div
                        className={cn(
                          "flex items-center justify-end space-x-1 mt-2",
                          isOwn ? "text-white/70" : "text-white/60",
                        )}
                      >
                        <span className="text-xs">{formatTimestamp(message.created_at)}</span>
                        {getStatusIndicator(message, isOwn)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-white/15 border border-white/20 backdrop-blur-sm text-white rounded-2xl rounded-bl-md px-4 py-2 max-w-[85%] sm:max-w-[80%] shadow-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 border-t border-border glass-apple bg-background">
        <div className="flex items-end space-x-3">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-muted/50 rounded-full transition-colors">
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-muted/50 rounded-full transition-colors">
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12 rounded-full text-sm border-2 focus:border-primary/50 transition-colors"
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full p-0 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
