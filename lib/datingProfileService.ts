import { supabase } from './supabaseClient'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DatingProfile {
  id?: string
  user_id: string
  name: string
  video_url?: string
  video_file_name?: string
  setup_completed?: boolean
  preferences_completed?: boolean
  questionnaire_completed?: boolean
  created_at?: string
  updated_at?: string
}

export interface ProfilePhoto {
  id?: string
  user_id: string
  photo_url: string
  photo_file_name?: string
  caption?: string
  display_order: number
  is_primary?: boolean
}

export interface DatingPreference {
  id?: string
  user_id: string
  looking_for: 'men' | 'women' | 'everyone'
  show_on_profile: boolean
  min_age?: number
  max_age?: number
  max_distance?: number
}

export interface ProfileInterest {
  user_id: string
  interest_category: string
  interest_name: string
}

export interface ProfilePrompt {
  user_id: string
  prompt_question: string
  prompt_answer: string
  display_order: number
}

export interface ThisOrThatChoice {
  user_id: string
  option_a: string
  option_b: string
  selected_option: 0 | 1
  question_index: number
}

export interface RelationshipGoal {
  user_id: string
  goal_description: string
}

export interface ServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// STEP 1: PROFILE SETUP FUNCTIONS
// ============================================

/**
 * Save or update basic profile information (name)
 */
export async function saveDatingProfile(
  userId: string,
  name: string,
  videoUrl?: string,
  videoFileName?: string
): Promise<ServiceResponse<DatingProfile>> {
  try {
    const { data, error } = await supabase
      .from('dating_profiles')
      .upsert(
        {
          user_id: userId,
          name,
          video_url: videoUrl,
          video_file_name: videoFileName,
          setup_completed: true,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error saving dating profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload photo to Supabase Storage
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<ServiceResponse<string>> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName)

    return { success: true, data: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error uploading photo:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save profile photo metadata to database
 */
export async function saveProfilePhoto(
  userId: string,
  photoUrl: string,
  photoFileName: string,
  caption: string,
  displayOrder: number,
  isPrimary: boolean = false
): Promise<ServiceResponse<ProfilePhoto>> {
  try {
    const { data, error } = await supabase
      .from('profile_photos')
      .insert({
        user_id: userId,
        photo_url: photoUrl,
        photo_file_name: photoFileName,
        caption,
        display_order: displayOrder,
        is_primary: isPrimary,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error saving photo metadata:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload video to Supabase Storage
 */
export async function uploadProfileVideo(
  userId: string,
  file: File
): Promise<ServiceResponse<string>> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('profile-videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-videos')
      .getPublicUrl(fileName)

    return { success: true, data: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error uploading video:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Complete profile setup step - upload all photos and save profile
 */
export async function completeProfileSetup(
  userId: string,
  name: string,
  photos: Array<{ file: File; caption: string }>,
  videoFile?: File
): Promise<ServiceResponse> {
  try {
    // 1. Save basic profile
    const profileResult = await saveDatingProfile(userId, name)
    if (!profileResult.success) throw new Error(profileResult.error)

    // 2. Upload and save photos
    for (let i = 0; i < photos.length; i++) {
      const { file, caption } = photos[i]
      
      // Upload photo
      const uploadResult = await uploadProfilePhoto(userId, file)
      if (!uploadResult.success) throw new Error(uploadResult.error)

      // Save photo metadata
      const photoResult = await saveProfilePhoto(
        userId,
        uploadResult.data!,
        file.name,
        caption,
        i,
        i === 0 // First photo is primary
      )
      if (!photoResult.success) throw new Error(photoResult.error)
    }

    // 3. Upload video if provided
    if (videoFile) {
      const videoResult = await uploadProfileVideo(userId, videoFile)
      if (!videoResult.success) throw new Error(videoResult.error)

      // Update profile with video URL
      await supabase
        .from('dating_profiles')
        .update({
          video_url: videoResult.data,
          video_file_name: videoFile.name,
        })
        .eq('user_id', userId)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error completing profile setup:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// STEP 2: DATING PREFERENCES FUNCTIONS
// ============================================

/**
 * Save or update dating preferences
 */
export async function saveDatingPreferences(
  userId: string,
  lookingFor: 'men' | 'women' | 'everyone',
  showOnProfile: boolean,
  minAge?: number,
  maxAge?: number,
  maxDistance?: number
): Promise<ServiceResponse<DatingPreference>> {
  try {
    const { data, error } = await supabase
      .from('dating_preferences')
      .upsert(
        {
          user_id: userId,
          looking_for: lookingFor,
          show_on_profile: showOnProfile,
          min_age: minAge || 18,
          max_age: maxAge || 35,
          max_distance: maxDistance || 25,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error

    // Update profile completion status
    await supabase
      .from('dating_profiles')
      .update({ preferences_completed: true })
      .eq('user_id', userId)

    return { success: true, data }
  } catch (error: any) {
    console.error('Error saving dating preferences:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// STEP 3: QUESTIONNAIRE FUNCTIONS
// ============================================

/**
 * Save multiple interests
 */
export async function saveInterests(
  userId: string,
  interests: Array<{ category: string; name: string }>
): Promise<ServiceResponse> {
  try {
    // Delete existing interests first
    await supabase.from('profile_interests').delete().eq('user_id', userId)

    // Insert new interests
    const interestsData = interests.map((interest) => ({
      user_id: userId,
      interest_category: interest.category,
      interest_name: interest.name,
    }))

    const { error } = await supabase
      .from('profile_interests')
      .insert(interestsData)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error saving interests:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save profile prompts/answers
 */
export async function savePrompts(
  userId: string,
  prompts: Array<{ question: string; answer: string }>
): Promise<ServiceResponse> {
  try {
    // Delete existing prompts first
    await supabase.from('profile_prompts').delete().eq('user_id', userId)

    // Insert new prompts
    const promptsData = prompts.map((prompt, index) => ({
      user_id: userId,
      prompt_question: prompt.question,
      prompt_answer: prompt.answer,
      display_order: index,
    }))

    const { error } = await supabase
      .from('profile_prompts')
      .insert(promptsData)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error saving prompts:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save "this or that" choices
 */
export async function saveThisOrThatChoices(
  userId: string,
  choices: Array<{ optionA: string; optionB: string; selected: 0 | 1; index: number }>
): Promise<ServiceResponse> {
  try {
    // Delete existing choices first
    await supabase.from('this_or_that_choices').delete().eq('user_id', userId)

    // Insert new choices (only save answered ones)
    const choicesData = choices
      .filter(choice => choice.selected !== null)
      .map((choice) => ({
        user_id: userId,
        option_a: choice.optionA,
        option_b: choice.optionB,
        selected_option: choice.selected,
        question_index: choice.index,
      }))

    if (choicesData.length > 0) {
      const { error } = await supabase
        .from('this_or_that_choices')
        .insert(choicesData)

      if (error) throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error saving this or that choices:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save relationship goal
 */
export async function saveRelationshipGoal(
  userId: string,
  goal: string
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('relationship_goals')
      .upsert(
        {
          user_id: userId,
          goal_description: goal,
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error saving relationship goal:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update age range and distance preferences
 */
export async function updatePreferenceRanges(
  userId: string,
  minAge: number,
  maxAge: number,
  maxDistance: number
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('dating_preferences')
      .update({
        min_age: minAge,
        max_age: maxAge,
        max_distance: maxDistance,
      })
      .eq('user_id', userId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error updating preference ranges:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Complete entire questionnaire - saves all questionnaire data
 */
export async function completeQuestionnaire(
  userId: string,
  data: {
    interests: Array<{ category: string; name: string }>
    prompts: Array<{ question: string; answer: string }>
    choices: Array<{ optionA: string; optionB: string; selected: 0 | 1; index: number }>
    goal: string
    minAge: number
    maxAge: number
    maxDistance: number
  }
): Promise<ServiceResponse> {
  try {
    // Save all questionnaire data
    await saveInterests(userId, data.interests)
    await savePrompts(userId, data.prompts)
    await saveThisOrThatChoices(userId, data.choices)
    await saveRelationshipGoal(userId, data.goal)
    await updatePreferenceRanges(userId, data.minAge, data.maxAge, data.maxDistance)

    // Update profile completion status
    await supabase
      .from('dating_profiles')
      .update({ questionnaire_completed: true })
      .eq('user_id', userId)

    return { success: true }
  } catch (error: any) {
    console.error('Error completing questionnaire:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// RETRIEVAL FUNCTIONS
// ============================================

/**
 * Get complete dating profile for a user
 */
export async function getDatingProfile(userId: string): Promise<ServiceResponse> {
  try {
    const { data, error } = await supabase.rpc('get_complete_dating_profile', {
      p_user_id: userId,
    })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting dating profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get profile completion status
 */
export async function getProfileCompletion(userId: string): Promise<ServiceResponse> {
  try {
    const { data, error } = await supabase.rpc('get_dating_profile_completion', {
      p_user_id: userId,
    })

    if (error) throw error

    return { success: true, data: data?.[0] || null }
  } catch (error: any) {
    console.error('Error getting profile completion:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's photos
 */
export async function getProfilePhotos(userId: string): Promise<ServiceResponse<ProfilePhoto[]>> {
  try {
    const { data, error } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error getting profile photos:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's dating preferences
 */
export async function getDatingPreferences(userId: string): Promise<ServiceResponse<DatingPreference>> {
  try {
    const { data, error } = await supabase
      .from('dating_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting dating preferences:', error)
    return { success: false, error: error.message }
  }
}

