"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, X } from "lucide-react"

interface MatchNotificationProps {
  match: {
    id: string
    name: string
    avatar: string
    age: number
    mutualInterests: string[]
  }
  onStartChat: () => void
  onKeepSwiping: () => void
  onClose: () => void
}

export function MatchNotification({ match, onStartChat, onKeepSwiping, onClose }: MatchNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm mx-auto overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-pink-500 to-rose-500 p-6 text-white text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="space-y-4">
              <div className="h-8" />

              <div>
                <h2 className="text-2xl font-bold mb-1">It's a Match!</h2>
                <p className="text-white/90 text-sm">You and {match.name} liked each other</p>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-primary">
                  <AvatarImage src={match.avatar || "/placeholder.svg"} alt={match.name} />
                  <AvatarFallback className="text-xl">{match.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">
                {match.name}, {match.age}
              </h3>

              {match.mutualInterests.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">You both like:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {match.mutualInterests.slice(0, 3).map((interest) => (
                      <span key={interest} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button className="w-full" size="lg" onClick={onStartChat}>
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chatting
              </Button>

              <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={onKeepSwiping}>
                Keep Swiping
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
