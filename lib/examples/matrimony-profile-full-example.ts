/**
 * Example: Insert/Update Matrimony Profile Full
 * 
 * This file demonstrates how to use the matrimony_profile_full table
 * with the Supabase client in Next.js.
 */

import { supabase } from '../supabaseClient'
import { MatrimonyProfileFull } from '../matrimonyService'

/**
 * Example: Insert a new matrimony profile
 */
export async function exampleInsertMatrimonyProfile(userId: string) {
  try {
    const profileData: Partial<MatrimonyProfileFull> = {
      user_id: userId,
      name: 'Priya Sharma',
      age: 28,
      gender: 'Female',
      created_by: 'Self',
      photos: [
        'https://your-supabase-url.supabase.co/storage/v1/object/public/matrimony-photos/user-id/photo1.jpg',
        'https://your-supabase-url.supabase.co/storage/v1/object/public/matrimony-photos/user-id/photo2.jpg',
      ],
      personal: {
        height_cm: 165,
        height_unit: 'cm',
        complexion: 'Fair',
        body_type: 'Slim',
        diet: 'Vegetarian',
        smoker: false,
        drinker: false,
        marital_status: 'Never Married',
      },
      career: {
        highest_education: 'Masters',
        college: 'Delhi University',
        job_title: 'Software Engineer',
        company: 'Tech Corp',
        annual_income: '10-15 Lakhs',
        work_location: {
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
        },
      },
      family: {
        family_type: 'Nuclear',
        family_values: 'Traditional',
        father_occupation: 'Business',
        mother_occupation: 'Homemaker',
        brothers: 1,
        sisters: 0,
        siblings_married: 'Yes',
        show_on_profile: true,
      },
      cultural: {
        religion: 'Hindu',
        mother_tongue: 'Hindi',
        community: 'Punjabi',
        sub_caste: 'Khatri',
        date_of_birth: '1995-05-15',
        time_of_birth: '10:30',
        place_of_birth: 'Delhi',
        star_raashi: 'Taurus',
        gotra: 'Bhardwaj',
      },
      bio: 'Looking for a life partner who shares similar values and interests. Love traveling and cooking.',
      partner_preferences: {
        min_age: 28,
        max_age: 35,
        min_height_cm: 170,
        max_height_cm: 185,
        diet_prefs: ['Vegetarian'],
        lifestyle_prefs: ['Non-smoker', 'Non-drinker'],
        education_prefs: ['Masters', 'PhD'],
        profession_prefs: ['Engineer', 'Doctor', 'Business'],
        locations: ['Delhi', 'Mumbai', 'Bangalore'],
        communities: ['Punjabi', 'Hindu'],
        family_type_prefs: ['Nuclear', 'Joint'],
      },
      step1_completed: true,
      step2_completed: true,
      step3_completed: true,
      step4_completed: true,
      step5_completed: true,
      step6_completed: true,
      step7_completed: true,
      profile_completed: true,
    }

    const { data, error } = await supabase
      .from('matrimony_profile_full')
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
 * Example: Update an existing matrimony profile
 */
export async function exampleUpdateMatrimonyProfile(
  userId: string,
  updates: Partial<MatrimonyProfileFull>
) {
  try {
    // Get existing profile to preserve fields
    const { data: existing } = await supabase
      .from('matrimony_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (!existing) {
      throw new Error('Profile not found')
    }

    // Merge updates with existing data
    const updatedData: Partial<MatrimonyProfileFull> = {
      ...existing,
      ...updates,
      // Merge JSONB fields properly
      photos: updates.photos || existing.photos || [],
      personal: {
        ...(existing.personal as any),
        ...(updates.personal as any),
      },
      career: {
        ...(existing.career as any),
        ...(updates.career as any),
      },
      family: {
        ...(existing.family as any),
        ...(updates.family as any),
      },
      cultural: {
        ...(existing.cultural as any),
        ...(updates.cultural as any),
      },
      partner_preferences: {
        ...(existing.partner_preferences as any),
        ...(updates.partner_preferences as any),
      },
    }

    const { data, error } = await supabase
      .from('matrimony_profile_full')
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
 * Example: Upsert (insert or update) a matrimony profile
 */
export async function exampleUpsertMatrimonyProfile(
  userId: string,
  profileData: Partial<MatrimonyProfileFull>
) {
  try {
    const { data, error } = await supabase
      .from('matrimony_profile_full')
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
 * Example: Get a complete matrimony profile
 */
export async function exampleGetMatrimonyProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('matrimony_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

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
      .from('matrimony_profile_full')
      .select('photos')
      .eq('user_id', userId)
      .maybeSingle()

    const existingPhotos = (existing?.photos as string[]) || []
    const updatedPhotos = [...existingPhotos, photoUrl]

    const { data, error } = await supabase
      .from('matrimony_profile_full')
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
 * Example: Update partner preferences only
 */
export async function exampleUpdatePartnerPreferences(
  userId: string,
  preferences: {
    min_age?: number
    max_age?: number
    min_height_cm?: number
    max_height_cm?: number
    diet_prefs?: string[]
  }
) {
  try {
    // Get existing preferences
    const { data: existing } = await supabase
      .from('matrimony_profile_full')
      .select('partner_preferences')
      .eq('user_id', userId)
      .maybeSingle()

    const existingPrefs = (existing?.partner_preferences as any) || {}
    const updatedPrefs = {
      ...existingPrefs,
      ...preferences,
    }

    const { data, error } = await supabase
      .from('matrimony_profile_full')
      .update({ partner_preferences: updatedPrefs })
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

