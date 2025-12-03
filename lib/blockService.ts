import { supabase } from './supabaseClient'

export async function blockUser(blockerId: string, blockedId: string, matchType: 'dating' | 'matrimony'): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert into blocked_users table
    const { error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        match_type: matchType,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error blocking user:', error)
      return { success: false, error: error.message }
    }

    // Deactivate the match between these users
    const matchTable = matchType === 'dating' ? 'dating_matches' : 'matrimony_matches'
    const { error: matchError } = await supabase
      .from(matchTable)
      .update({ is_active: false })
      .or(`and(user1_id.eq.${blockerId},user2_id.eq.${blockedId}),and(user1_id.eq.${blockedId},user2_id.eq.${blockerId})`)

    if (matchError) {
      console.error('Error deactivating match:', matchError)
      // Don't return error here as blocking was successful, just log it
    }

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error blocking user:', error)
    return { success: false, error: error.message }
  }
}

export async function unblockUser(blockerId: string, blockedId: string, matchType: 'dating' | 'matrimony'): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .eq('match_type', matchType)

    if (error) {
      console.error('Error unblocking user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error unblocking user:', error)
    return { success: false, error: error.message }
  }
}

export async function isUserBlocked(blockerId: string, blockedId: string, matchType: 'dating' | 'matrimony'): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .eq('match_type', matchType)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Error checking if user is blocked:', error)
    return false
  }
}

export async function getBlockedUsers(userId: string, matchType: 'dating' | 'matrimony'): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', userId)
      .eq('match_type', matchType)

    if (error) {
      console.error('Error getting blocked users:', error)
      return []
    }

    return data?.map(item => item.blocked_id) || []
  } catch (error) {
    console.error('Unexpected error getting blocked users:', error)
    return []
  }
}
