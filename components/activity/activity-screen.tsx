"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Eye, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { StaticBackground } from "@/components/discovery/static-background"

interface ActivityItem {
  id: string
  type: 'match' | 'like' | 'view'
  name: string
  avatar: string
  age?: number
  timestamp: string
  isNew?: boolean
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "match",
    name: "Priya",
    avatar: "/professional-woman-smiling.png",
    age: 26,
    timestamp: "2m ago",
    isNew: true,
  },
  {
    id: "2",
    type: "like",
    name: "Ananya",
    avatar: "/woman-hiking.png",
    age: 28,
    timestamp: "15m ago",
    isNew: true,
  },
  {
    id: "3",
    type: "view",
    name: "Kavya",
    avatar: "/woman-at-coffee-shop.png",
    age: 25,
    timestamp: "1h ago",
  },
  {
    id: "4",
    type: "match",
    name: "Riya",
    avatar: "/woman-with-family.jpg",
    age: 27,
    timestamp: "3h ago",
  },
  {
    id: "5",
    type: "like",
    name: "Sneha",
    avatar: "/casual-outdoor-photo.jpg",
    age: 29,
    timestamp: "5h ago",
  },
  {
    id: "6",
    type: "view",
    name: "Meera",
    avatar: "/professional-headshot.png",
    age: 24,
    timestamp: "1d ago",
  },
  {
    id: "7",
    type: "like",
    name: "Aisha",
    avatar: "/placeholder-user.jpg",
    age: 26,
    timestamp: "2d ago",
  },
  {
    id: "8",
    type: "view",
    name: "Divya",
    avatar: "/professional-woman-smiling.png",
    age: 28,
    timestamp: "3d ago",
  },
]

interface ActivityScreenProps {
  onProfileClick?: (userId: string) => void
  onMatchClick?: (userId: string) => void
}

export function ActivityScreen({ onProfileClick, onMatchClick }: ActivityScreenProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'matches' | 'likes' | 'views'>('all')
  const [likedBack, setLikedBack] = useState<Set<string>>(new Set())

  const handleLikeBack = (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLikedBack(prev => new Set(prev).add(activityId))
    // In a real app, this would create a match and you could navigate to chat
    // For now, we'll just update the UI
    setTimeout(() => {
      // Optionally show a match notification or navigate to chat
      // onMatchClick?.(activityId)
    }, 500)
  }

  const filteredActivities = mockActivities.filter(activity => {
    if (activeTab === 'all') return true
    return activity.type === activeTab
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Sparkles className="w-4 h-4 text-violet-400" />
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-current" />
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'match':
        return 'You matched!'
      case 'like':
        return 'liked your profile'
      case 'view':
        return 'viewed your profile'
      default:
        return ''
    }
  }

  const tabs = [
    { id: 'all', label: 'All', count: mockActivities.length },
    { id: 'matches', label: 'Matches', count: mockActivities.filter(a => a.type === 'match').length },
    { id: 'likes', label: 'Likes', count: mockActivities.filter(a => a.type === 'like').length },
    { id: 'views', label: 'Views', count: mockActivities.filter(a => a.type === 'view').length },
  ]

  return (
    <div className="flex flex-col h-full relative">
      {/* Static Background */}
      <StaticBackground />
      
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border glass-apple">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Activity</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge className="ml-2 bg-background/50 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
            <p className="text-muted-foreground text-sm">
              Start swiping to see matches, likes, and views here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white/15 border border-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  if (activity.type === 'match') {
                    onMatchClick?.(activity.id)
                  } else {
                    onProfileClick?.(activity.id)
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12 border-2 border-white/30">
                      <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.name} />
                      <AvatarFallback className="bg-white/20 text-white">{activity.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <h3 className="font-semibold text-sm text-white truncate">
                        {activity.name}
                        {activity.age && <span className="text-white/70 ml-1">, {activity.age}</span>}
                      </h3>
                      {activity.isNew && (
                        <Badge className="bg-violet-500/80 text-white text-xs px-1.5 py-0.5 border border-white/20">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/70">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>

                  {activity.type === 'match' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMatchClick?.(activity.id)
                      }}
                      className="bg-violet-500/80 hover:bg-violet-500/90 text-white"
                    >
                      Chat
                    </Button>
                  )}

                  {activity.type === 'like' && (
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={(e) => handleLikeBack(activity.id, e)}
                        className={cn(
                          "rounded-full p-1.5 transition-all duration-200 hover:scale-110 active:scale-95",
                          likedBack.has(activity.id)
                            ? "bg-red-500/20 border-2 border-red-500"
                            : "bg-black/40 border-2 border-white/60 hover:border-white/80"
                        )}
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4 transition-all duration-200",
                            likedBack.has(activity.id)
                              ? "text-red-500 fill-red-500"
                              : "text-black fill-black stroke-white stroke-[2.5]"
                          )}
                        />
                      </button>
                      <span className={cn(
                        "text-[10px] font-medium transition-colors",
                        likedBack.has(activity.id)
                          ? "text-red-400"
                          : "text-white/70"
                      )}>
                        {likedBack.has(activity.id) ? "Liked!" : "Like Back"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

