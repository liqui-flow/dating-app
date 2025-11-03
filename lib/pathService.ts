import { supabase } from './supabaseClient'

export type PathType = 'dating' | 'matrimony'

/**
 * Save user's selected path (dating or matrimony) to the database
 */
export async function saveUserPath(userId: string, path: PathType) {
  try {
    // Check if user profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is okay
      throw fetchError
    }

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          path,
          path_selected_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } else {
      // Create new profile with path
      // Note: This requires date_of_birth and gender, so you might want to handle this differently
      console.warn('No existing profile found. Path will be saved when profile is created.')
      return { 
        success: false, 
        error: 'No profile found. Complete profile setup first.' 
      }
    }
  } catch (error: any) {
    console.error('Error saving user path:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to save path selection' 
    }
  }
}

/**
 * Get user's selected path from the database
 */
export async function getUserPath(userId: string): Promise<PathType | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('path')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return null
      }
      throw error
    }

    return data?.path as PathType | null
  } catch (error) {
    console.error('Error fetching user path:', error)
    return null
  }
}

/**
 * Create or update user profile with path
 * Use this if you want to save path even without full profile
 */
export async function upsertUserPath(
  userId: string, 
  path: PathType,
  additionalData?: {
    date_of_birth?: string
    gender?: string
  }
) {
  try {
    const updateData: any = {
      user_id: userId,
      path,
      path_selected_at: new Date().toISOString(),
      ...additionalData
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(updateData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error upserting user path:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to save path selection' 
    }
  }
}

