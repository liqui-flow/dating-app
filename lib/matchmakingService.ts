import { supabase } from './supabaseClient'

export interface LikeAction {
  success: boolean
  isMatch?: boolean
  matchId?: string
  error?: string
}

export interface Match {
  id: string
  matchedUserId: string
  matchedUserName: string
  matchedUserPhoto?: string
  matchedAt: string
  mutualInterests?: string[]
  matchedUserDob?: string
}

/**
 * Record a like/pass for dating
 */
export async function recordDatingLike(
  likerId: string,
  likedId: string,
  action: 'like' | 'pass' | 'super_like'
): Promise<LikeAction> {
  try {
    console.log('[recordDatingLike] Starting:', { likerId, likedId, action })

    // Use upsert with ON CONFLICT to handle both insert and update
    const payload = {
      liker_id: likerId,
      liked_id: likedId,
      action
    }

    console.log('[recordDatingLike] Inserting payload:', payload)

    // Try insert first, if it fails due to unique constraint, update instead
    let data, error
    const { data: insertData, error: insertError } = await supabase
      .from('dating_likes')
      .insert(payload)
      .select()
      .single()

    if (insertError) {
      // If unique constraint violation, update instead
      if (insertError.code === '23505' || insertError.message?.includes('unique')) {
        console.log('[recordDatingLike] Row exists, updating instead')
        const { data: updateData, error: updateError } = await supabase
          .from('dating_likes')
          .update({ action })
          .eq('liker_id', likerId)
          .eq('liked_id', likedId)
          .select()
          .single()
        
        data = updateData
        error = updateError
      } else {
        data = insertData
        error = insertError
      }
    } else {
      data = insertData
      error = insertError
    }

    if (error) {
      console.error('[recordDatingLike] Insert error:', error)
      throw error
    }

    console.log('[recordDatingLike] Insert successful:', data)

    // Check for mutual match (only if action is 'like' or 'super_like')
    if (action === 'like' || action === 'super_like') {
      // Wait a bit for trigger to potentially create match
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Check if match was created by trigger - use proper OR condition
      const { data: matches, error: matchError } = await supabase
        .from('dating_matches')
        .select('*')
        .eq('is_active', true)

      if (matchError) {
        console.error('[recordDatingLike] Match query error:', matchError)
      } else {
        console.log('[recordDatingLike] All matches:', matches)
      }

      // Find match between these two users
      const match = matches?.find(m => 
        (m.user1_id === likerId && m.user2_id === likedId) ||
        (m.user1_id === likedId && m.user2_id === likerId)
      )

      if (match) {
        console.log('[recordDatingLike] Match found!', match)
        return {
          success: true,
          isMatch: true,
          matchId: match.id
        }
      } else {
        console.log('[recordDatingLike] No match found yet')
      }
    }

    return { success: true, isMatch: false }
  } catch (error: any) {
    console.error('[recordDatingLike] Error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Record a like/pass for matrimony
 */
export async function recordMatrimonyLike(
  likerId: string,
  likedId: string,
  action: 'like' | 'pass' | 'connect'
): Promise<LikeAction> {
  try {
    console.log('[recordMatrimonyLike] Starting:', { likerId, likedId, action })

    // Use upsert with ON CONFLICT to handle both insert and update
    const payload = {
      liker_id: likerId,
      liked_id: likedId,
      action
    }

    console.log('[recordMatrimonyLike] Inserting payload:', payload)

    // Try insert first, if it fails due to unique constraint, update instead
    let data, error
    const { data: insertData, error: insertError } = await supabase
      .from('matrimony_likes')
      .insert(payload)
      .select()
      .single()

    if (insertError) {
      // If unique constraint violation, update instead
      if (insertError.code === '23505' || insertError.message?.includes('unique')) {
        console.log('[recordMatrimonyLike] Row exists, updating instead')
        const { data: updateData, error: updateError } = await supabase
          .from('matrimony_likes')
          .update({ action })
          .eq('liker_id', likerId)
          .eq('liked_id', likedId)
          .select()
          .single()
        
        data = updateData
        error = updateError
      } else {
        data = insertData
        error = insertError
      }
    } else {
      data = insertData
      error = insertError
    }

    if (error) {
      console.error('[recordMatrimonyLike] Insert error:', error)
      throw error
    }

    console.log('[recordMatrimonyLike] Insert successful:', data)

    // Check for mutual match
    if (action === 'like' || action === 'connect') {
      // Wait a bit for trigger to potentially create match
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Check if match was created by trigger - use proper query
      const { data: matches, error: matchError } = await supabase
        .from('matrimony_matches')
        .select('*')
        .eq('is_active', true)

      if (matchError) {
        console.error('[recordMatrimonyLike] Match query error:', matchError)
      } else {
        console.log('[recordMatrimonyLike] All matches:', matches)
      }

      // Find match between these two users
      const match = matches?.find(m => 
        (m.user1_id === likerId && m.user2_id === likedId) ||
        (m.user1_id === likedId && m.user2_id === likerId)
      )

      if (match) {
        console.log('[recordMatrimonyLike] Match found!', match)
        return {
          success: true,
          isMatch: true,
          matchId: match.id
        }
      } else {
        console.log('[recordMatrimonyLike] No match found yet')
      }
    }

    return { success: true, isMatch: false }
  } catch (error: any) {
    console.error('[recordMatrimonyLike] Error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all matches for dating
 */
export async function getDatingMatches(userId: string): Promise<Match[]> {
  try {
    console.log('[getDatingMatches] Fetching matches for user:', userId)
    
    const { data: matches, error } = await supabase
      .from('dating_matches')
      .select('*')
      .eq('is_active', true)
      .order('matched_at', { ascending: false })

    if (error) {
      console.error('[getDatingMatches] Error:', error)
      throw error
    }

    console.log('[getDatingMatches] Raw matches:', matches)

    // Filter matches where user is either user1 or user2
    const userMatches = matches?.filter(m => 
      m.user1_id === userId || m.user2_id === userId
    ) || []

    console.log('[getDatingMatches] Filtered matches for user:', userMatches)

    if (!userMatches || userMatches.length === 0) {
      console.log('[getDatingMatches] No matches found')
      return []
    }

    // Get matched user profiles
    const matchPromises = userMatches.map(async (match) => {
      const matchedUserId = match.user1_id === userId ? match.user2_id : match.user1_id
      
      // Get profile
      const { data: profile } = await supabase
        .from('dating_profile_full')
        .select('name, photos, interests, dob')
        .eq('user_id', matchedUserId)
        .maybeSingle()

      // Get mutual interests
      const { data: userProfile } = await supabase
        .from('dating_profile_full')
        .select('interests')
        .eq('user_id', userId)
        .maybeSingle()

      const userInterests = (userProfile?.interests as string[]) || []
      const matchedInterests = (profile?.interests as string[]) || []
      const mutualInterests = userInterests.filter(i => matchedInterests.includes(i))

      return {
        id: match.id,
        matchedUserId,
        matchedUserName: profile?.name || 'Unknown',
        matchedUserPhoto: (profile?.photos as string[])?.[0],
        matchedAt: match.matched_at,
        mutualInterests,
        matchedUserDob: profile?.dob
      }
    })

    return Promise.all(matchPromises)
  } catch (error: any) {
    console.error('Error getting dating matches:', error)
    return []
  }
}

/**
 * Get all matches for matrimony
 */
export async function getMatrimonyMatches(userId: string): Promise<Match[]> {
  try {
    console.log('[getMatrimonyMatches] Fetching matches for user:', userId)
    
    const { data: matches, error } = await supabase
      .from('matrimony_matches')
      .select('*')
      .eq('is_active', true)
      .order('matched_at', { ascending: false })

    if (error) {
      console.error('[getMatrimonyMatches] Error:', error)
      throw error
    }

    console.log('[getMatrimonyMatches] Raw matches:', matches)

    // Filter matches where user is either user1 or user2
    const userMatches = matches?.filter(m => 
      m.user1_id === userId || m.user2_id === userId
    ) || []

    console.log('[getMatrimonyMatches] Filtered matches for user:', userMatches)

    if (!userMatches || userMatches.length === 0) {
      console.log('[getMatrimonyMatches] No matches found')
      return []
    }

    const matchPromises = userMatches.map(async (match) => {
      const matchedUserId = match.user1_id === userId ? match.user2_id : match.user1_id
      
      const { data: profile } = await supabase
        .from('matrimony_profile_full')
        .select('name, photos')
        .eq('user_id', matchedUserId)
        .maybeSingle()

      return {
        id: match.id,
        matchedUserId,
        matchedUserName: profile?.name || 'Unknown',
        matchedUserPhoto: (profile?.photos as string[])?.[0],
        matchedAt: match.matched_at
      }
    })

    return Promise.all(matchPromises)
  } catch (error: any) {
    console.error('Error getting matrimony matches:', error)
    return []
  }
}

/**
 * Get profiles user has already liked/passed (to exclude from discovery)
 */
export async function getDatingLikedProfiles(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('dating_likes')
      .select('liked_id')
      .eq('liker_id', userId)

    if (error) throw error
    return data?.map(d => d.liked_id) || []
  } catch (error: any) {
    console.error('Error getting liked profiles:', error)
    return []
  }
}

/**
 * Get profiles user has already liked/passed for matrimony
 */
export async function getMatrimonyLikedProfiles(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('matrimony_likes')
      .select('liked_id')
      .eq('liker_id', userId)

    if (error) throw error
    return data?.map(d => d.liked_id) || []
  } catch (error: any) {
    console.error('Error getting liked profiles:', error)
    return []
  }
}

/**
 * Activity item interface for activity screen
 */
export interface ActivityItem {
  id: string
  type: 'match' | 'like' | 'view'
  name: string
  avatar: string
  age?: number
  timestamp: string
  isNew?: boolean
  userId: string // The user ID for navigation
}

/**
 * Get likes received by a user (people who liked them)
 */
export async function getDatingLikesReceived(userId: string): Promise<ActivityItem[]> {
  try {
    console.log('[getDatingLikesReceived] Fetching likes received for user:', userId)
    
    // Get likes where user is the liked_id
    const { data: likes, error } = await supabase
      .from('dating_likes')
      .select('id, liker_id, action, created_at')
      .eq('liked_id', userId)
      .in('action', ['like', 'super_like'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getDatingLikesReceived] Error:', error)
      throw error
    }

    if (!likes || likes.length === 0) {
      console.log('[getDatingLikesReceived] No likes received')
      return []
    }

    // Check which likes the user has already liked back
    const { data: userLikes } = await supabase
      .from('dating_likes')
      .select('liked_id')
      .eq('liker_id', userId)
      .in('action', ['like', 'super_like'])

    const likedBackUserIds = new Set(userLikes?.map(l => l.liked_id) || [])

    // Get profiles for all likers
    const likerIds = likes.map(l => l.liker_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('dating_profile_full')
      .select('user_id, name, photos, dob')
      .in('user_id', likerIds)

    if (profilesError) {
      console.error('[getDatingLikesReceived] Error fetching profiles:', profilesError)
      return []
    }

    // Create a map of user_id to profile
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

    // Format activities, excluding ones where user already liked back (those become matches)
    const activities: ActivityItem[] = []
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    for (const like of likes) {
      // Skip if user already liked back (this would be a match, not a like)
      if (likedBackUserIds.has(like.liker_id)) {
        continue
      }

      const profile = profileMap.get(like.liker_id)
      if (!profile) continue

      const createdAt = new Date(like.created_at)
      const isNew = createdAt > oneDayAgo

      // Calculate age from dob if available
      let age: number | undefined
      if (profile.dob) {
        const birthDate = new Date(profile.dob)
        age = now.getFullYear() - birthDate.getFullYear()
        const monthDiff = now.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
          age--
        }
      }

      activities.push({
        id: like.id,
        type: 'like',
        name: profile.name || 'Unknown',
        avatar: (profile.photos as string[])?.[0] || '/placeholder-user.jpg',
        age,
        timestamp: like.created_at,
        isNew,
        userId: like.liker_id
      })
    }

    return activities
  } catch (error: any) {
    console.error('[getDatingLikesReceived] Error:', error)
    return []
  }
}

/**
 * Format timestamp to relative time (e.g., "2m ago", "1h ago")
 */
function formatTimestamp(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

/**
 * Get all activity for dating (matches + likes received)
 */
export async function getDatingActivity(userId: string): Promise<ActivityItem[]> {
  try {
    console.log('[getDatingActivity] Fetching activity for user:', userId)
    
    // Fetch matches and likes received in parallel
    const [matches, likesReceived] = await Promise.all([
      getDatingMatches(userId),
      getDatingLikesReceived(userId)
    ])

    const activities: (ActivityItem & { originalTimestamp: string })[] = []
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Convert matches to activity items
    for (const match of matches) {
      const matchedAt = new Date(match.matchedAt)
      const isNew = matchedAt > oneDayAgo

      // Calculate age from dob if available
      let age: number | undefined
      if (match.matchedUserDob) {
        const birthDate = new Date(match.matchedUserDob)
        age = now.getFullYear() - birthDate.getFullYear()
        const monthDiff = now.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
          age--
        }
      }

      activities.push({
        id: match.id,
        type: 'match',
        name: match.matchedUserName,
        avatar: match.matchedUserPhoto || '/placeholder-user.jpg',
        age,
        timestamp: formatTimestamp(match.matchedAt),
        isNew,
        userId: match.matchedUserId,
        originalTimestamp: match.matchedAt
      })
    }

    // Add likes received (they already have formatted timestamps, but we need original for sorting)
    for (const like of likesReceived) {
      activities.push({
        ...like,
        timestamp: formatTimestamp(like.timestamp),
        originalTimestamp: like.timestamp
      })
    }

    // Sort by original timestamp (newest first)
    activities.sort((a, b) => {
      const timeA = new Date(a.originalTimestamp).getTime()
      const timeB = new Date(b.originalTimestamp).getTime()
      return timeB - timeA
    })

    // Remove originalTimestamp before returning
    return activities.map(({ originalTimestamp, ...item }) => item)
  } catch (error: any) {
    console.error('[getDatingActivity] Error:', error)
    return []
  }
}

