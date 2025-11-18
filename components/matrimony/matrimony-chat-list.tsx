"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreVertical, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { StaticBackground } from "@/components/discovery/static-background"
import { getMatrimonyMatches, type Match } from "@/lib/matchmakingService"
import { supabase } from "@/lib/supabaseClient"

interface ChatPreview {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
  isMatch: boolean
  isPremium: boolean
}

interface MatrimonyChatListProps {
  onChatClick?: (chatId: string) => void
}

export function MatrimonyChatList({ onChatClick }: MatrimonyChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState<"all" | "matches" | "shortlisted">("all")
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const matches = await getMatrimonyMatches(user.id)
        
        // Convert matches to chat previews
        const chatPreviews: ChatPreview[] = matches.map((match) => ({
          id: match.matchedUserId,
          name: match.matchedUserName,
          avatar: match.matchedUserPhoto || "/placeholder-user.jpg",
          lastMessage: "You matched! Start the conversation.",
          timestamp: formatRelativeTime(match.matchedAt),
          unreadCount: 0, // TODO: Implement unread message count
          isOnline: false, // TODO: Implement online status
          isMatch: true,
          isPremium: false, // TODO: Get premium status from profile
        }))

        setChats(chatPreviews)
      } catch (error) {
        console.error('Error loading matches:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [])

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
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

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTimestamp = (timestamp: string) => timestamp

  if (loading) {
    return (
      <div className="flex flex-col h-full relative">
        <StaticBackground />
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading matches...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Static Background */}
      <StaticBackground />
      
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border glass-apple">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
            <p className="text-muted-foreground text-sm">Connect with profiles to start conversations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="bg-white/15 border border-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-200 cursor-pointer"
                onClick={() => onChatClick?.(chat.id)}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12 border-2 border-white/30">
                      <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                      <AvatarFallback className="bg-white/20 text-white">{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    {chat.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white/30 rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-sm text-white truncate">{chat.name}</h3>
                        {chat.isPremium && (
                          <Badge className="bg-[#4A0E0E] text-white text-xs px-1.5 py-0.5 border border-white/20">
                            Premium
                          </Badge>
                        )}
                        {chat.isMatch && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-white/60">{formatTimestamp(chat.timestamp)}</span>
                        {chat.unreadCount > 0 && (
                          <Badge className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border border-white/30">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate",
                        chat.unreadCount > 0 ? "font-medium text-white/90" : "text-white/70",
                      )}
                    >
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}