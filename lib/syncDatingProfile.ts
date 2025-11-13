/**
 * Utility function to sync dob and gender from user_profiles to dating_profile_full
 * Use this to manually sync existing data
 */

import { supabase } from './supabaseClient'

/**
 * Sync dob and gender from user_profiles to dating_profile_full for a specific user
 */
export async function syncDatingProfileFromUserProfile(userId: string) {
  try {
    // Get user profile data
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('date_of_birth, gender, selected_path')
      .eq('user_id', userId)
      .maybeSingle()

    if (userProfileError) {
      console.error('Error fetching user profile:', userProfileError)
      return { success: false, error: userProfileError.message }
    }

    if (!userProfile) {
      return { success: false, error: 'User profile not found' }
    }

    // Only sync if user has selected dating path
    if (userProfile.selected_path !== 'dating') {
      return { success: false, error: 'User has not selected dating path' }
    }

    // Get existing dating profile
    const { data: existingDatingProfile } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Prepare update data
    const updateData: any = {}
    
    if (userProfile.date_of_birth) {
      updateData.dob = userProfile.date_of_birth
    }
    
    if (userProfile.gender) {
      const genderValue = userProfile.gender.toLowerCase() === 'prefer_not_to_say' 
        ? null 
        : userProfile.gender.toLowerCase()
      updateData.gender = genderValue
    }

    if (existingDatingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('dating_profile_full')
        .update(updateData)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating dating profile:', error)
        return { success: false, error: error.message }
      }

      return { success: true, message: 'Dating profile updated with dob and gender' }
    } else {
      // Create new profile
      const { error } = await supabase
        .from('dating_profile_full')
        .insert({
          user_id: userId,
          name: '', // Will be set later
          dob: userProfile.date_of_birth || null,
          gender: userProfile.gender?.toLowerCase() === 'prefer_not_to_say' 
            ? null 
            : userProfile.gender?.toLowerCase() || null,
          interests: [],
          prompts: [],
          photos: [],
          preferences: {},
          this_or_that_choices: [],
        })

      if (error) {
        console.error('Error creating dating profile:', error)
        return { success: false, error: error.message }
      }

      return { success: true, message: 'Dating profile created with dob and gender' }
    }
  } catch (error: any) {
    console.error('Error syncing dating profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sync all users' dob and gender from user_profiles to dating_profile_full
 * Use this for bulk migration
 */
export async function syncAllDatingProfiles() {
  try {
    // Get all users with dating path
    const { data: userProfiles, error } = await supabase
      .from('user_profiles')
      .select('user_id, date_of_birth, gender')
      .eq('selected_path', 'dating')

    if (error) {
      console.error('Error fetching user profiles:', error)
      return { success: false, error: error.message }
    }

    if (!userProfiles || userProfiles.length === 0) {
      return { success: true, message: 'No users with dating path found' }
    }

    let successCount = 0
    let errorCount = 0

    for (const userProfile of userProfiles) {
      const result = await syncDatingProfileFromUserProfile(userProfile.user_id)
      if (result.success) {
        successCount++
      } else {
        errorCount++
        console.error(`Failed to sync user ${userProfile.user_id}:`, result.error)
      }
    }

    return {
      success: true,
      message: `Synced ${successCount} profiles. ${errorCount} errors.`,
      successCount,
      errorCount,
    }
  } catch (error: any) {
    console.error('Error syncing all dating profiles:', error)
    return { success: false, error: error.message }
  }
}

