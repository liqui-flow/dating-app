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
  "m1": {
    id: "m1",
    name: "Aditi Sharma",
    avatar: "/professional-woman-smiling.png",
    isOnline: true,
    isPremium: true,
  },
  "m2": {
    id: "m2",
    name: "Rahul Mehta",
    avatar: "/professional-headshot.png",
    isOnline: false,
    lastSeen: "1h ago",
    isPremium: false,
  },
  "m3": {
    id: "m3",
    name: "Priya Patel",
    avatar: "/woman-at-coffee-shop.png",
    isOnline: true,
    isPremium: false,
  },
  "m4": {
    id: "m4",
    name: "Arjun Singh",
    avatar: "/new-profile-photo.jpg",
    isOnline: false,
    lastSeen: "2h ago",
    isPremium: true,
  },
  "m5": {
    id: "m5",
    name: "Sneha Reddy",
    avatar: "/woman-hiking.png",
    isOnline: false,
    lastSeen: "1d ago",
    isPremium: false,
  },
}

// Mock initial messages for each chat
const mockChatMessages: Record<string, Message[]> = {
  "m1": [
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
      text: "Thank you for expressing interest in my profile.",
      timestamp: "2h ago",
      isOwn: false,
      isRead: true,
      type: "text",
    },
    {
      id: "3",
      text: "Hi Aditi! I'm really impressed by your profile. Your family values align perfectly with ours.",
      timestamp: "1h ago",
      isOwn: true,
      isRead: true,
      type: "text",
    },
  ],
  "m2": [
    {
      id: "1",
      text: "It's a match! 🎉",
      timestamp: "3h ago",
      isOwn: false,
      isRead: true,
      type: "match",
    },
    {
      id: "2",
      text: "Our families could connect this weekend. Would you be interested?",
      timestamp: "3h ago",
      isOwn: false,
      isRead: true,
      type: "text",
    },
    {
      id: "3",
      text: "That sounds wonderful! I'll discuss with my family and get back to you.",
      timestamp: "2h ago",
      isOwn: true,
      isRead: true,
      type: "text",
    },
  ],
  "m3": [
    {
      id: "1",
      text: "It's a match! 🎉",
      timestamp: "4h ago",
      isOwn: false,
      isRead: true,
      type: "match",
    },
    {
      id: "2",
      text: "Hi! I saw your profile and would love to connect.",
      timestamp: "4h ago",
      isOwn: false,
      isRead: true,
      type: "text",
    },
    {
      id: "3",
      text: "Hello Priya! Thank you for reaching out. I'd love to know more about you.",
      timestamp: "3h ago",
      isOwn: true,
      isRead: true,
      type: "text",
    },
  ],
  "m4": [
    {
      id: "1",
      text: "It's a match! 🎉",
      timestamp: "5h ago",
      isOwn: false,
      isRead: true,
      type: "match",
    },
    {
      id: "2",
      text: "Namaste! Your family values align with ours. Would you like to meet?",
      timestamp: "5h ago",
      isOwn: false,
      isRead: true,
      type: "text",
    },
    {
      id: "3",
      text: "Namaste Arjun! I'm glad our values match. I'd be happy to meet.",
      timestamp: "4h ago",
      isOwn: true,
      isRead: true,
      type: "text",
    },
  ],
  "m5": [
    {
      id: "1",
      text: "It's a match! 🎉",
      timestamp: "1d ago",
      isOwn: false,
      isRead: true,
      type: "match",
    },
    {
      id: "2",
      text: "Would you like to meet for coffee this weekend?",
      timestamp: "1d ago",
      isOwn: false,
      isRead: true,
      type: "text",
    },
    {
      id: "3",
      text: "That sounds great! I'd love to meet for coffee. What time works for you?",
      timestamp: "1d ago",
      isOwn: true,
      isRead: true,
      type: "text",
    },
  ],
}

interface MatrimonyChatScreenProps {
  chatId: string
  onBack: () => void
}

export function MatrimonyChatScreen({ chatId, onBack }: MatrimonyChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(mockChatMessages[chatId] || [])
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
      
      // Auto-reply with various matrimony-appropriate responses after 1-3 seconds
      const autoReplies = [
        "hi",
        "Namaste! 🙏",
        "That's wonderful to hear!",
        "I completely agree with you",
        "Our families would be pleased",
        "That sounds perfect!",
        "I'm so happy to know this",
        "This is exactly what I was hoping for",
        "Your values align with ours",
        "I'm excited to learn more! 😊"
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

  if (!chatUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Chat not found</p>
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-muted/50 rounded-full" 
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chatUser.avatar || "/placeholder.svg"} alt={chatUser.name} />
                  <AvatarFallback className="text-lg">{chatUser.name[0]}</AvatarFallback>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={message.id} className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
              {message.type === "match" ? (
                <div className="flex justify-center my-3">
                  <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 text-primary px-4 py-3 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg animate-pulse">
                    <Heart className="w-4 h-4 fill-current animate-bounce" />
                    <span>{message.text}</span>
                  </div>
                </div>
              ) : (
                <div className={cn("flex mb-3", message.isOwn ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[80%] px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl",
                      "backdrop-blur-sm border",
                      message.isOwn
                        ? "bg-white/20 border-white/30 text-white rounded-br-md"
                        : "bg-white/15 border-white/20 text-white rounded-bl-md",
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div
                      className={cn(
                        "flex items-center justify-end space-x-1 mt-2",
                        message.isOwn ? "text-white/70" : "text-white/60",
                      )}
                    >
                      <span className="text-xs">{message.timestamp}</span>
                      {message.isOwn && (
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                            message.isRead ? "text-white/70" : "text-white/50",
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
        </div>
        
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
