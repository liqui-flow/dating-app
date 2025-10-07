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

const mockUser: ChatUser = {
  id: "1",
  name: "Priya",
  avatar: "/indian-woman-professional.png",
  isOnline: true,
  isPremium: false,
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

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border glass-apple">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                  <AvatarFallback>{mockUser.name[0]}</AvatarFallback>
                </Avatar>
                {mockUser.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-semibold">{mockUser.name}</h2>
                  {mockUser.isPremium && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{mockUser.isOnline ? "Online now" : mockUser.lastSeen}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === "match" ? (
              <div className="flex justify-center">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{message.text}</span>
                </div>
              </div>
            ) : (
              <div className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2 rounded-2xl",
                    message.isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md",
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
                          "w-4 h-4 rounded-full flex items-center justify-center",
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
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 border-t border-border glass-apple">
        <div className="flex items-end space-x-3">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12 rounded-full"
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full p-0"
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
