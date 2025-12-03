'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getDatingActivity, getMatrimonyActivity, type ActivityItem } from '@/lib/matchmakingService'

export function useUnreadActivityCount(mode: 'dating' | 'matrimony' = 'dating') {
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const processedActivityIds = useRef<Set<string>>(new Set())
  const lastFetchTime = useRef<number>(0)

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [])

  // Fetch unread activity count function
  const fetchUnreadActivityCount = async (userId: string) => {
    try {
      // Rate limiting - don't fetch more than once every 2 seconds
      const now = Date.now()
      if (now - lastFetchTime.current < 2000) {
        return
      }
      lastFetchTime.current = now

      const activities = mode === 'matrimony' 
        ? await getMatrimonyActivity(userId)
        : await getDatingActivity(userId)
      
      // Count only new/unseen activities (activities with isNew flag or recent ones)
      const newActivities = activities.filter(activity => {
        // Check if activity is marked as new or is very recent (within last 5 minutes)
        const isMarkedNew = activity.isNew
        const activityTime = new Date(activity.timestamp).getTime()
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
        const isRecent = activityTime > fiveMinutesAgo
        
        // Prevent duplicate processing
        if (processedActivityIds.current.has(activity.id)) {
          return false
        }
        
        if (isMarkedNew || isRecent) {
          processedActivityIds.current.add(activity.id)
          return true
        }
        
        return false
      })

      const count = newActivities.length
      console.log(`[useUnreadActivityCount] Fetched unread activity count (${mode}):`, count)
      setUnreadCount(count)
    } catch (error) {
      console.error('[useUnreadActivityCount] Error fetching unread activity count:', error)
    }
  }

  // Fetch initial unread count
  useEffect(() => {
    if (!currentUserId) return
    fetchUnreadActivityCount(currentUserId)
  }, [currentUserId, mode])

  // Refresh count when tab becomes visible
  useEffect(() => {
    if (!currentUserId) return

    const handleVisibilityChange = () => {
      if (!document.hidden && currentUserId) {
        console.log('[useUnreadActivityCount] Tab became visible, refreshing activity count')
        fetchUnreadActivityCount(currentUserId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Also refresh when window gains focus
    const handleFocus = () => {
      if (currentUserId) {
        console.log('[useUnreadActivityCount] Window gained focus, refreshing activity count')
        fetchUnreadActivityCount(currentUserId)
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [currentUserId, mode])

  // Refresh count periodically (every 15 seconds for activity)
  useEffect(() => {
    if (!currentUserId) return

    const interval = setInterval(async () => {
      await fetchUnreadActivityCount(currentUserId)
    }, 15000)

    return () => clearInterval(interval)
  }, [currentUserId, mode])

  // Clean up processed activity IDs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Keep only the last 500 activity IDs
      if (processedActivityIds.current.size > 500) {
        const idsArray = Array.from(processedActivityIds.current)
        processedActivityIds.current = new Set(idsArray.slice(-500))
      }
    }, 60000) // Clean up every minute

    return () => clearInterval(interval)
  }, [])

  // Function to manually mark activity as read
  const markActivityAsRead = () => {
    console.log('[useUnreadActivityCount] Marking all activity as read')
    setUnreadCount(0)
  }

  return { unreadCount, markActivityAsRead }
}
