"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Eye, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { StaticBackground } from "@/components/discovery/static-background"
import { supabase } from "@/lib/supabaseClient"
import { 
  getDatingActivity, 
  getMatrimonyActivity,
  recordDatingLike,
  recordMatrimonyLike,
  type ActivityItem 
} from "@/lib/matchmakingService"

interface ActivityScreenProps {
  onProfileClick?: (userId: string) => void
  onMatchClick?: (matchId: string) => void
  mode?: 'dating' | 'matrimony'
}

export function ActivityScreen({ onProfileClick, onMatchClick, mode = 'dating' }: ActivityScreenProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'matches' | 'likes' | 'views'>('all')
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedBack, setLikedBack] = useState<Set<string>>(new Set())
  const [likingInProgress, setLikingInProgress] = useState<Set<string>>(new Set())

  // Fetch activity data
  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true)
        setError(null)
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError("Please log in to view activity")
          setLoading(false)
          return
        }

        // Use mode to determine which function to call
        const activityData = mode === 'matrimony' 
          ? await getMatrimonyActivity(user.id)
          : await getDatingActivity(user.id)
        setActivities(activityData)
      } catch (err: any) {
        console.error("Error fetching activity:", err)
        setError(err.message || "Failed to load activity")
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [mode])

  const handleLikeBack = async (activity: ActivityItem, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (likingInProgress.has(activity.id)) return
    
    try {
      setLikingInProgress(prev => new Set(prev).add(activity.id))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Please log in to like back")
        return
      }

      // Use mode to determine which function to call
      const result = mode === 'matrimony'
        ? await recordMatrimonyLike(user.id, activity.userId, 'like')
        : await recordDatingLike(user.id, activity.userId, 'like')
      
      if (result.success) {
        setLikedBack(prev => new Set(prev).add(activity.id))
        
        // If it's a match, update the activity type and refresh
        if (result.isMatch) {
          // Update the activity to be a match
          setActivities(prev => prev.map(a => 
            a.id === activity.id 
              ? { ...a, type: 'match' as const }
              : a
          ))
          
          // Optionally navigate to chat
          if (result.matchId && onMatchClick) {
            setTimeout(() => {
              onMatchClick(result.matchId)
            }, 500)
          }
        } else {
          // Refresh activity list to remove the like (since user liked back)
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          if (currentUser) {
            const updatedActivity = mode === 'matrimony'
              ? await getMatrimonyActivity(currentUser.id)
              : await getDatingActivity(currentUser.id)
            setActivities(updatedActivity)
          }
        }
      } else {
        setError(result.error || "Failed to like back")
      }
    } catch (err: any) {
      console.error("Error liking back:", err)
      setError(err.message || "Failed to like back")
    } finally {
      setLikingInProgress(prev => {
        const next = new Set(prev)
        next.delete(activity.id)
        return next
      })
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'all') return true
    if (activeTab === 'views') return false // Views not implemented yet
    
    // Map tab IDs to activity types
    const tabToTypeMap: Record<string, 'match' | 'like' | 'view'> = {
      'matches': 'match',
      'likes': 'like',
      'views': 'view'
    }
    
    return activity.type === tabToTypeMap[activeTab]
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
    { id: 'all', label: 'All', count: activities.length },
    { id: 'matches', label: 'Matches', count: activities.filter(a => a.type === 'match').length },
    { id: 'likes', label: 'Likes', count: activities.filter(a => a.type === 'like').length },
    { id: 'views', label: 'Views', count: activities.filter(a => a.type === 'view').length },
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
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Loading activity...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error loading activity</h3>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button
              onClick={async () => {
                setError(null)
                setLoading(true)
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    const activityData = mode === 'matrimony'
                      ? await getMatrimonyActivity(user.id)
                      : await getDatingActivity(user.id)
                    setActivities(activityData)
                  }
                } catch (err: any) {
                  setError(err.message || "Failed to load activity")
                } finally {
                  setLoading(false)
                }
              }}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        ) : filteredActivities.length === 0 ? (
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
                onClick={async () => {
                  if (activity.type === 'match') {
                    // Get matchId from database
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                      const { getMatchIdAuto } = await import('@/lib/chatService')
                      const matchInfo = await getMatchIdAuto(user.id, activity.userId)
                      if (matchInfo && onMatchClick) {
                        onMatchClick(matchInfo.matchId)
                      }
                    }
                  } else {
                    onProfileClick?.(activity.userId)
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
                        onMatchClick?.(activity.userId)
                      }}
                      className="bg-violet-500/80 hover:bg-violet-500/90 text-white"
                    >
                      Chat
                    </Button>
                  )}

                  {activity.type === 'like' && (
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={(e) => handleLikeBack(activity, e)}
                        disabled={likingInProgress.has(activity.id) || likedBack.has(activity.id)}
                        className={cn(
                          "rounded-full p-1.5 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                          likedBack.has(activity.id)
                            ? "bg-red-500/20 border-2 border-red-500"
                            : "bg-black/40 border-2 border-white/60 hover:border-white/80"
                        )}
                      >
                        {likingInProgress.has(activity.id) ? (
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                          <Heart
                            className={cn(
                              "w-4 h-4 transition-all duration-200",
                              likedBack.has(activity.id)
                                ? "text-red-500 fill-red-500"
                                : "text-black fill-black stroke-white stroke-[2.5]"
                            )}
                          />
                        )}
                      </button>
                      <span className={cn(
                        "text-[10px] font-medium transition-colors",
                        likedBack.has(activity.id)
                          ? "text-red-400"
                          : "text-white/70"
                      )}>
                        {likingInProgress.has(activity.id) 
                          ? "Liking..." 
                          : likedBack.has(activity.id) 
                            ? "Liked!" 
                            : "Like Back"}
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

