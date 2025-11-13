/**
 * Example: Insert/Update Dating Profile Full
 * 
 * This file demonstrates how to use the dating_profile_full table
 * with the Supabase client in Next.js.
 */

import { supabase } from '../supabaseClient'
import { DatingProfileFull } from '../datingProfileService'

/**
 * Example: Insert a new dating profile
 */
export async function exampleInsertDatingProfile(userId: string) {
  try {
    const profileData: Partial<DatingProfileFull> = {
      user_id: userId,
      name: 'John Doe',
      dob: '1990-01-15',
      gender: 'male',
      bio: 'Love traveling and trying new foods!',
      interests: ['Music', 'Travel', 'Food', 'Photography'],
      prompts: [
        { prompt: 'Best trip I\'ve taken', answer: 'Backpacking through Europe' },
        { prompt: 'I\'m looking for', answer: 'Someone adventurous and fun' },
      ],
      photos: [
        'https://your-supabase-url.supabase.co/storage/v1/object/public/profile-photos/user-id/photo1.jpg',
        'https://your-supabase-url.supabase.co/storage/v1/object/public/profile-photos/user-id/photo2.jpg',
      ],
      preferences: {
        looking_for: 'women',
        show_on_profile: true,
        min_age: 25,
        max_age: 35,
        max_distance: 50,
      },
      relationship_goals: 'Looking for a long-term relationship',
      this_or_that_choices: [
        { option_a: 'Beach', option_b: 'Mountains', selected: 0, question_index: 0 },
        { option_a: 'Coffee', option_b: 'Tea', selected: 1, question_index: 1 },
      ],
      setup_completed: true,
      preferences_completed: true,
      questionnaire_completed: true,
    }

    const { data, error } = await supabase
      .from('dating_profile_full')
      .insert(profileData)
      .select()
      .single()

    if (error) throw error

    console.log('Profile inserted:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error inserting profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Example: Update an existing dating profile
 */
export async function exampleUpdateDatingProfile(
  userId: string,
  updates: Partial<DatingProfileFull>
) {
  try {
    // Get existing profile to preserve fields
    const { data: existing } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!existing) {
      throw new Error('Profile not found')
    }

    // Merge updates with existing data
    const updatedData: Partial<DatingProfileFull> = {
      ...existing,
      ...updates,
      // Merge JSONB fields properly
      interests: updates.interests || existing.interests || [],
      prompts: updates.prompts || existing.prompts || [],
      photos: updates.photos || existing.photos || [],
      preferences: {
        ...(existing.preferences as any),
        ...(updates.preferences as any),
      },
      this_or_that_choices: updates.this_or_that_choices || existing.this_or_that_choices || [],
    }

    const { data, error } = await supabase
      .from('dating_profile_full')
      .update(updatedData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    console.log('Profile updated:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Example: Upsert (insert or update) a dating profile
 */
export async function exampleUpsertDatingProfile(
  userId: string,
  profileData: Partial<DatingProfileFull>
) {
  try {
    const { data, error } = await supabase
      .from('dating_profile_full')
      .upsert(
        {
          user_id: userId,
          ...profileData,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error

    console.log('Profile upserted:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error upserting profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Example: Get a complete dating profile
 */
export async function exampleGetDatingProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    console.log('Profile retrieved:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Example: Add a new photo to existing profile
 */
export async function exampleAddPhoto(userId: string, photoUrl: string) {
  try {
    // Get existing photos
    const { data: existing } = await supabase
      .from('dating_profile_full')
      .select('photos')
      .eq('user_id', userId)
      .single()

    const existingPhotos = (existing?.photos as string[]) || []
    const updatedPhotos = [...existingPhotos, photoUrl]

    const { data, error } = await supabase
      .from('dating_profile_full')
      .update({ photos: updatedPhotos })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    console.log('Photo added:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error adding photo:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Example: Update preferences only
 */
export async function exampleUpdatePreferences(
  userId: string,
  preferences: {
    looking_for?: 'men' | 'women' | 'everyone'
    min_age?: number
    max_age?: number
    max_distance?: number
  }
) {
  try {
    // Get existing preferences
    const { data: existing } = await supabase
      .from('dating_profile_full')
      .select('preferences')
      .eq('user_id', userId)
      .single()

    const existingPrefs = (existing?.preferences as any) || {}
    const updatedPrefs = {
      ...existingPrefs,
      ...preferences,
    }

    const { data, error } = await supabase
      .from('dating_profile_full')
      .update({ preferences: updatedPrefs })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    console.log('Preferences updated:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error updating preferences:', error)
    return { success: false, error: error.message }
  }
}

