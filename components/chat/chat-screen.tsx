"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Phone, Video, MoreVertical, Send, ImageIcon, Smile, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  timestamp: string
  isOwn: boolean
  isRead: boolean
  type: "text" | "image" | "match"
}

interface ChatUser {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: string
  isPremium: boolean
}

// Mock data for different chat users
const mockChatUsers: Record<string, ChatUser> = {
  "1": {
    id: "1",
    name: "Priya",
    avatar: "/indian-woman-professional.png",
    isOnline: true,
    isPremium: false,
  },
  "2": {
    id: "2",
    name: "Ananya",
    avatar: "/professional-woman-smiling.png",
    isOnline: false,
    lastSeen: "1h ago",
    isPremium: true,
  },
  "3": {
    id: "3",
    name: "Kavya",
    avatar: "/woman-hiking.png",
    isOnline: true,
    isPremium: false,
  },
  "4": {
    id: "4",
    name: "Riya",
    avatar: "/woman-at-coffee-shop.png",
    isOnline: false,
    lastSeen: "1d ago",
    isPremium: false,
  },
  "5": {
    id: "5",
    name: "Sneha",
    avatar: "/woman-with-family.jpg",
    isOnline: true,
    isPremium: false,
  },
  "6": {
    id: "6",
    name: "Meera",
    avatar: "/casual-outdoor-photo.jpg",
    isOnline: false,
    lastSeen: "3d ago",
    isPremium: true,
  },
  "7": {
    id: "7",
    name: "Aisha",
    avatar: "/professional-headshot.png",
    isOnline: false,
    lastSeen: "4d ago",
    isPremium: false,
  },
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "It's a match! 🎉",
    timestamp: "2h ago",
    isOwn: false,
    isRead: true,
    type: "match",
  },
  {
    id: "2",
    text: "Hey! Thanks for the like. How's your day going?",
    timestamp: "2h ago",
    isOwn: false,
    isRead: true,
    type: "text",
  },
  {
    id: "3",
    text: "Hi Priya! My day's been great, thanks for asking. I love your travel photos - where was that mountain shot taken?",
    timestamp: "1h ago",
    isOwn: true,
    isRead: true,
    type: "text",
  },
  {
    id: "4",
    text: "That was from my trip to Himachal Pradesh last month! The view was absolutely breathtaking 🏔️",
    timestamp: "45m ago",
    isOwn: false,
    isRead: true,
    type: "text",
  },
  {
    id: "5",
    text: "Wow, that sounds amazing! I've been wanting to plan a mountain trip. Any recommendations?",
    timestamp: "30m ago",
    isOwn: true,
    isRead: true,
    type: "text",
  },
  {
    id: "6",
    text: "Definitely! Manali and Kasol are must-visits. I can share some hidden gems if you're interested 😊",
    timestamp: "2m ago",
    isOwn: false,
    isRead: false,
    type: "text",
  },
]

interface ChatScreenProps {
  chatId?: string
  onBack?: () => void
}

export function ChatScreen({ chatId = "1", onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const chatUser = mockChatUsers[chatId]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        timestamp: "now",
        isOwn: true,
        isRead: false,
        type: "text",
      }
      setMessages([...messages, message])
      setNewMessage("")
      
      // Show typing indicator
      setIsTyping(true)
      
      // Auto-reply with various responses after 1-3 seconds
      const autoReplies = [
        "hi",
        "hey there! 😊",
        "that's interesting!",
        "tell me more!",
        "I love that!",
        "sounds great!",
        "really? that's awesome!",
        "I totally agree!",
        "that's so cool!",
        "amazing! 🤩"
      ]
      
      setTimeout(() => {
        setIsTyping(false)
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)]
        const autoReply: Message = {
          id: (Date.now() + 1).toString(),
          text: randomReply,
          timestamp: "now",
          isOwn: false,
          isRead: false,
          type: "text",
        }
        setMessages(prev => [...prev, autoReply])
      }, Math.random() * 2000 + 1000) // Random delay between 1-3 seconds
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border glass-apple bg-background">
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
                  <AvatarImage src={chatUser?.avatar || "/placeholder.svg"} alt={chatUser?.name || "User"} />
                  <AvatarFallback className="text-lg">{chatUser?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                {chatUser?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-lg text-foreground">{chatUser?.name || "User"}</h2>
                  {chatUser?.isPremium && (
                    <Badge className="bg-[#4A0E0E] text-white text-xs px-2 py-0">
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${chatUser?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <p className="text-sm text-muted-foreground">
                    {isTyping ? "typing..." : chatUser?.isOnline ? "Online now" : `Last seen ${chatUser?.lastSeen || 'recently'}`}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message, index) => (
          <div key={message.id} className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
            {message.type === "match" ? (
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 text-primary px-4 py-3 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg animate-pulse">
                  <Heart className="w-4 h-4 fill-current animate-bounce" />
                  <span>{message.text}</span>
                </div>
              </div>
            ) : (
              <div className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[80%] px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md",
                    message.isOwn
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-br-md"
                      : "bg-gradient-to-r from-muted to-muted/80 text-foreground rounded-bl-md",
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div
                    className={cn(
                      "flex items-center justify-end space-x-1 mt-1",
                      message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    <span className="text-xs">{message.timestamp}</span>
                    {message.isOwn && (
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                          message.isRead ? "text-primary-foreground/70" : "text-primary-foreground/50",
                        )}
                      >
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-2 max-w-[85%] sm:max-w-[80%]">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
