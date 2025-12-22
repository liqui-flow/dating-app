"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Eye, Sparkles, Loader2, ArrowLeft } from "lucide-react"
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
  onBack?: () => void
}

export function ActivityScreen({ onProfileClick, onMatchClick, mode = 'dating', onBack }: ActivityScreenProps) {
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
        
        if (result.isMatch) {
          // Match created - navigate to chat immediately
          setError(null) // Clear any errors
          if (result.matchId && onMatchClick) {
            onMatchClick(result.matchId) // Navigate immediately, no delay
          }
          // Don't refresh activity - let navigation happen
        } else {
          // Not a match - refresh activity list (but don't let errors block UI)
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            if (currentUser) {
              const updatedActivity = mode === 'matrimony'
                ? await getMatrimonyActivity(currentUser.id)
                : await getDatingActivity(currentUser.id)
              setActivities(updatedActivity)
            }
          } catch (refreshError) {
            // Log but don't show error - the like was successful
            console.error("Error refreshing activity:", refreshError)
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
        return <Sparkles className="w-4 h-4 text-[#97011A]" />
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-current" />
      case 'view':
        return <Eye className="w-4 h-4 text-white/60" />
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
    <div className="flex flex-col h-full relative bg-[#0E0F12] min-h-screen">
      {/* Static Background */}
      <StaticBackground />
      
      {/* Header with Back Button */}
      <div className="flex-shrink-0 p-4 border-b border-white/20 bg-[#14161B]/50 backdrop-blur-xl shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {onBack && (
                <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-white/10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20" 
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: '#FFFFFF' }} />
              </Button>
            )}
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Activity</h1>
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
                    ? "bg-[#97011A]"
                    : "bg-white/10 hover:bg-white/20"
                )}
                style={{ color: activeTab === tab.id ? '#FFFFFF' : '#A1A1AA' }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge className="ml-2 bg-white/20 text-white text-xs">
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
            <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
            <p className="text-sm" style={{ color: '#FFFFFF' }}>Loading activity...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" style={{ color: '#A1A1AA' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>Error loading activity</h3>
            <p className="text-sm mb-4" style={{ color: '#A1A1AA' }}>{error}</p>
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
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" style={{ color: '#A1A1AA' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>No activity yet</h3>
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Start swiping to see matches, likes, and views here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-[#14161B] border border-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl hover:bg-white/10 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  // Always open profile when clicking on the card
                  onProfileClick?.(activity.userId)
                }}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12 border-2 border-white/30">
                      <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.name} />
                      <AvatarFallback className="bg-white/20" style={{ color: '#FFFFFF' }}>{activity.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <h3 className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }}>
                        {activity.name}
                        {activity.age && <span className="ml-1" style={{ color: '#A1A1AA' }}>, {activity.age}</span>}
                      </h3>
                      {activity.isNew && (
                        <Badge className="bg-[#97011A] text-white text-xs px-1.5 py-0.5 border border-white/20">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: '#A1A1AA' }}>
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {activity.timestamp}
                    </p>
                  </div>

                  {activity.type === 'match' && (
                    <Button
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation()
                        const { data: { user } } = await supabase.auth.getUser()
                        if (user) {
                          const { getMatchId, getMatchIdAuto } = await import('@/lib/chatService')
                          // In matrimony mode, always use matrimony match type
                          // In dating mode, try both (dating first)
                          const matchId = mode === 'matrimony'
                            ? await getMatchId(user.id, activity.userId, 'matrimony')
                            : (await getMatchIdAuto(user.id, activity.userId))?.matchId
                          
                          if (matchId && onMatchClick) {
                            onMatchClick(matchId)
                          } else if (onProfileClick) {
                            // Fall back to opening profile if matchId not found
                            onProfileClick(activity.userId)
                          }
                        }
                      }}
                      className="bg-[#97011A] hover:bg-[#7A0115] text-white"
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
                                : "text-white fill-white"
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

