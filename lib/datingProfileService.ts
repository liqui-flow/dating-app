import { supabase } from './supabaseClient'

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Consolidated dating profile type - matches dating_profile_full table
 */
export interface DatingProfileFull {
  id?: string
  user_id: string
  name: string
  dob?: string | null
  gender?: string | null
  latitude?: number | null
  longitude?: number | null
  bio?: string | null
  interests?: string[] // Array of interest strings (e.g., ["Music", "Travel", "Food"])
  prompts?: Array<{ prompt: string; answer: string }> // Array of prompt/answer objects
  photos?: string[] // Array of photo URLs
  photo_prompts?: string[] // Array of photo captions/prompts (e.g., ["Me in my element", "What I look like on a Sunday"])
  preferences?: {
    looking_for?: 'men' | 'women' | 'everyone'
    show_on_profile?: boolean
    min_age?: number
    max_age?: number
    max_distance?: number
    [key: string]: any // Allow additional preference fields
  }
  this_or_that_choices?: Array<{
    option_a: string
    option_b: string
    selected: 0 | 1
    question_index?: number
  }>
  relationship_goals?: string | null
  video_url?: string | null
  video_file_name?: string | null
  setup_completed?: boolean
  preferences_completed?: boolean
  questionnaire_completed?: boolean
  created_at?: string
  updated_at?: string
}

// Legacy types for backward compatibility (kept for existing code that might reference them)
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
    // Get existing profile to preserve JSONB fields (handle case where profile doesn't exist)
    const { data: existing, error: fetchError } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle() // Use maybeSingle() instead of single() to avoid error if no row exists

    // Get dob and gender from user_profiles if not already in dating profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('date_of_birth, gender')
      .eq('user_id', userId)
      .maybeSingle()

    // Prepare the data to upsert
    const profileData: any = {
      user_id: userId,
      name,
      video_url: videoUrl || existing?.video_url || null,
      video_file_name: videoFileName || existing?.video_file_name || null,
      setup_completed: true,
    }

    // Sync dob and gender from user_profiles if available
    if (userProfile) {
      if (userProfile.date_of_birth && !existing?.dob) {
        profileData.dob = userProfile.date_of_birth
      } else if (existing?.dob) {
        profileData.dob = existing.dob
      }
      
      if (userProfile.gender && !existing?.gender) {
        const genderValue = userProfile.gender.toLowerCase() === 'prefer_not_to_say' 
          ? null 
          : userProfile.gender.toLowerCase()
        profileData.gender = genderValue
      } else if (existing?.gender) {
        profileData.gender = existing.gender
      }
    } else if (existing) {
      // Preserve existing dob and gender
      profileData.dob = existing.dob
      profileData.gender = existing.gender
    }

    // Only set JSONB fields if they exist, otherwise let database defaults handle it
    // But we need to explicitly set them to ensure they're initialized
    if (existing) {
      // Preserve existing JSONB fields
      profileData.interests = existing.interests || []
      profileData.prompts = existing.prompts || []
      profileData.photos = existing.photos || []
      profileData.preferences = existing.preferences || {}
      profileData.this_or_that_choices = existing.this_or_that_choices || []
    } else {
      // Initialize JSONB fields for new profile
      profileData.interests = []
      profileData.prompts = []
      profileData.photos = []
      profileData.preferences = {}
      profileData.this_or_that_choices = []
    }

    const { data, error } = await supabase
      .from('dating_profile_full')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Transform to legacy format for backward compatibility
    const legacyData: DatingProfile = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      video_url: data.video_url || undefined,
      video_file_name: data.video_file_name || undefined,
      setup_completed: data.setup_completed,
      preferences_completed: data.preferences_completed,
      questionnaire_completed: data.questionnaire_completed,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    return { success: true, data: legacyData }
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
 * Note: Photos are now stored in the photos JSONB array in dating_profile_full
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
    // Get existing profile
    const { data: existing, error: fetchError } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Update photos array - add new photo URL
    const existingPhotos = (existing?.photos as string[]) || []
    const updatedPhotos = [...existingPhotos, photoUrl]
    
    // Update photo_prompts array - add new caption
    const existingPhotoPrompts = (existing?.photo_prompts as string[]) || []
    const updatedPhotoPrompts = [...existingPhotoPrompts, caption || ""]

    // If profile doesn't exist, create it; otherwise update
    const profileData = existing
      ? { photos: updatedPhotos, photo_prompts: updatedPhotoPrompts }
      : {
          user_id: userId,
          name: '', // Will be set later in completeProfileSetup
          photos: updatedPhotos,
          photo_prompts: updatedPhotoPrompts,
          interests: [],
          prompts: [],
          preferences: {},
          this_or_that_choices: [],
        }

    const { data, error } = await supabase
      .from('dating_profile_full')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error

    // Return legacy format for backward compatibility
    const legacyData: ProfilePhoto = {
      id: data.id,
      user_id: data.user_id,
      photo_url: photoUrl,
      photo_file_name: photoFileName,
      caption,
      display_order: displayOrder,
      is_primary: isPrimary,
    }

    return { success: true, data: legacyData }
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
    // 1. Upload all photos first
    const photoUrls: string[] = []
    const photoPrompts: string[] = []
    for (let i = 0; i < photos.length; i++) {
      const { file, caption } = photos[i]
      const uploadResult = await uploadProfilePhoto(userId, file)
      if (!uploadResult.success) throw new Error(uploadResult.error)
      photoUrls.push(uploadResult.data!)
      photoPrompts.push(caption || "")
    }

    // 2. Upload video if provided
    let videoUrl: string | undefined
    let videoFileName: string | undefined
    if (videoFile) {
      const videoResult = await uploadProfileVideo(userId, videoFile)
      if (!videoResult.success) throw new Error(videoResult.error)
      videoUrl = videoResult.data
      videoFileName = videoFile.name
    }

    // 3. Get dob and gender from user_profiles if they exist
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('date_of_birth, gender')
      .eq('user_id', userId)
      .maybeSingle()

    // 4. Save everything to dating_profile_full in one operation
    const profileData: any = {
      user_id: userId,
      name,
      photos: photoUrls,
      photo_prompts: photoPrompts,
      video_url: videoUrl || null,
      video_file_name: videoFileName || null,
      setup_completed: true,
      // Initialize empty JSONB fields if not exists
      interests: [],
      prompts: [],
      preferences: {},
      this_or_that_choices: [],
    }

    // Sync dob and gender from user_profiles if available
    if (userProfile) {
      if (userProfile.date_of_birth) {
        profileData.dob = userProfile.date_of_birth
      }
      if (userProfile.gender) {
        // Convert gender format if needed (user_profiles might use different format)
        const gender = userProfile.gender.toLowerCase()
        profileData.gender = gender === 'prefer_not_to_say' ? null : gender
      }
    }

    const { data, error } = await supabase
      .from('dating_profile_full')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Supabase error completing profile setup:', error)
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error completing profile setup:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save or update dating bio
 */
export async function saveDatingBio(
  userId: string,
  bio: string
): Promise<ServiceResponse> {
  try {
    // Get existing profile to preserve other fields (handle case where profile doesn't exist)
    const { data: existing, error: fetchError } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle() // Use maybeSingle() to avoid error if no row exists

    // Prepare profile data
    const profileData: any = {
      user_id: userId,
      name: existing?.name || '',
      bio: bio || null,
    }

    // Preserve other fields if profile exists
    if (existing) {
      profileData.interests = existing.interests || []
      profileData.prompts = existing.prompts || []
      profileData.photos = existing.photos || []
      profileData.preferences = existing.preferences || {}
      profileData.this_or_that_choices = existing.this_or_that_choices || []
      profileData.setup_completed = existing.setup_completed || false
      profileData.preferences_completed = existing.preferences_completed || false
      profileData.questionnaire_completed = existing.questionnaire_completed || false
      profileData.video_url = existing.video_url || null
      profileData.video_file_name = existing.video_file_name || null
      profileData.dob = existing.dob || null
      profileData.gender = existing.gender || null
      profileData.relationship_goals = existing.relationship_goals || null
    } else {
      // Initialize JSONB fields for new profile
      profileData.interests = []
      profileData.prompts = []
      profileData.photos = []
      profileData.preferences = {}
      profileData.this_or_that_choices = []
      profileData.setup_completed = false
      profileData.preferences_completed = false
      profileData.questionnaire_completed = false
    }

    const { error } = await supabase
      .from('dating_profile_full')
      .upsert(profileData, { onConflict: 'user_id' })

    if (error) {
      console.error('Supabase error saving bio:', error)
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error saving dating bio:', error)
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
    // Get existing profile to preserve other fields (handle case where profile doesn't exist)
    const { data: existing, error: fetchError } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle() // Use maybeSingle() to avoid error if no row exists

    const preferences = {
      looking_for: lookingFor,
      show_on_profile: showOnProfile,
      min_age: minAge || 18,
      max_age: maxAge || 35,
      max_distance: maxDistance || 25,
    }

    // Prepare profile data
    const profileData: any = {
      user_id: userId,
      name: existing?.name || '',
      preferences: preferences,
      preferences_completed: true,
    }

    // Preserve other fields
    if (existing) {
      profileData.interests = existing.interests || []
      profileData.prompts = existing.prompts || []
      profileData.photos = existing.photos || []
      profileData.this_or_that_choices = existing.this_or_that_choices || []
      profileData.setup_completed = existing.setup_completed || false
      profileData.questionnaire_completed = existing.questionnaire_completed || false
      profileData.video_url = existing.video_url || null
      profileData.video_file_name = existing.video_file_name || null
    } else {
      // Initialize JSONB fields for new profile
      profileData.interests = []
      profileData.prompts = []
      profileData.photos = []
      profileData.this_or_that_choices = []
      profileData.setup_completed = false
      profileData.questionnaire_completed = false
    }

    const { data, error } = await supabase
      .from('dating_profile_full')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Supabase error saving preferences:', error)
      throw error
    }

    // Return legacy format for backward compatibility
    const legacyData: DatingPreference = {
      id: data.id,
      user_id: data.user_id,
      looking_for: preferences.looking_for,
      show_on_profile: preferences.show_on_profile,
      min_age: preferences.min_age,
      max_age: preferences.max_age,
      max_distance: preferences.max_distance,
    }

    return { success: true, data: legacyData }
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
    // Get existing profile to preserve other fields
    const { data: existing, error: fetchError } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Convert to array of interest strings (just the names)
    const interestNames = interests.map(interest => interest.name)

    // Prepare update data
    const updateData: any = {
      interests: interestNames,
    }

    // Preserve other fields if profile exists
    if (existing) {
      updateData.name = existing.name || ''
      updateData.prompts = existing.prompts || []
      updateData.photos = existing.photos || []
      updateData.preferences = existing.preferences || {}
      updateData.this_or_that_choices = existing.this_or_that_choices || []
    } else {
      // If profile doesn't exist, create it with all required fields
      updateData.user_id = userId
      updateData.name = ''
      updateData.prompts = []
      updateData.photos = []
      updateData.preferences = {}
      updateData.this_or_that_choices = []
    }

    const { error } = await supabase
      .from('dating_profile_full')
      .upsert(updateData, { onConflict: 'user_id' })

    if (error) {
      console.error('Supabase error saving interests:', error)
      throw error
    }

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
    // Get existing profile to preserve other fields
    const { data: existing, error: fetchError } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Convert to array of prompt/answer objects
    const promptsData = prompts.map(prompt => ({
      prompt: prompt.question,
      answer: prompt.answer,
    }))

    // Prepare update data
    const updateData: any = {
      prompts: promptsData,
    }

    // Preserve other fields if profile exists
    if (existing) {
      updateData.name = existing.name || ''
      updateData.interests = existing.interests || []
      updateData.photos = existing.photos || []
      updateData.preferences = existing.preferences || {}
      updateData.this_or_that_choices = existing.this_or_that_choices || []
    } else {
      // If profile doesn't exist, create it
      updateData.user_id = userId
      updateData.name = ''
      updateData.interests = []
      updateData.photos = []
      updateData.preferences = {}
      updateData.this_or_that_choices = []
    }

    const { error } = await supabase
      .from('dating_profile_full')
      .upsert(updateData, { onConflict: 'user_id' })

    if (error) {
      console.error('Supabase error saving prompts:', error)
      throw error
    }

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
    // Get existing profile to preserve other fields
    const { data: existing, error: fetchError } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Convert to array format for JSONB storage
    const choicesData = choices
      .filter(choice => choice.selected !== null && choice.selected !== undefined)
      .map((choice) => ({
        option_a: choice.optionA,
        option_b: choice.optionB,
        selected: choice.selected,
        question_index: choice.index,
      }))

    // Prepare update data
    const updateData: any = {
      this_or_that_choices: choicesData,
    }

    // Preserve other fields if profile exists
    if (existing) {
      updateData.name = existing.name || ''
      updateData.interests = existing.interests || []
      updateData.prompts = existing.prompts || []
      updateData.photos = existing.photos || []
      updateData.preferences = existing.preferences || {}
    } else {
      // If profile doesn't exist, create it
      updateData.user_id = userId
      updateData.name = ''
      updateData.interests = []
      updateData.prompts = []
      updateData.photos = []
      updateData.preferences = {}
    }

    const { error } = await supabase
      .from('dating_profile_full')
      .upsert(updateData, { onConflict: 'user_id' })

    if (error) {
      console.error('Supabase error saving choices:', error)
      throw error
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
    // Get existing profile to preserve other fields
    const { data: existing, error: fetchError } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Prepare profile data
    const profileData: any = {
      user_id: userId,
      name: existing?.name || '',
      relationship_goals: goal,
    }

    // Preserve other fields if profile exists
    if (existing) {
      profileData.interests = existing.interests || []
      profileData.prompts = existing.prompts || []
      profileData.photos = existing.photos || []
      profileData.preferences = existing.preferences || {}
      profileData.this_or_that_choices = existing.this_or_that_choices || []
      profileData.setup_completed = existing.setup_completed || false
      profileData.preferences_completed = existing.preferences_completed || false
      profileData.questionnaire_completed = existing.questionnaire_completed || false
    } else {
      // Initialize JSONB fields for new profile
      profileData.interests = []
      profileData.prompts = []
      profileData.photos = []
      profileData.preferences = {}
      profileData.this_or_that_choices = []
    }

    const { error } = await supabase
      .from('dating_profile_full')
      .upsert(profileData, { onConflict: 'user_id' })

    if (error) {
      console.error('Supabase error saving relationship goal:', error)
      throw error
    }

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
    // Get existing profile to preserve preferences
    const { data: existing } = await supabase
      .from('dating_profile_full')
      .select('preferences')
      .eq('user_id', userId)
      .single()

    const existingPreferences = (existing?.preferences as any) || {}
    const updatedPreferences = {
      ...existingPreferences,
      min_age: minAge,
      max_age: maxAge,
      max_distance: maxDistance,
    }

    const { error } = await supabase
      .from('dating_profile_full')
      .update({ preferences: updatedPreferences })
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
    // Get existing profile to preserve other fields
    const { data: existing, error: fetchError } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Prepare all data in one update
    const interestNames = data.interests.map(interest => interest.name)
    const promptsData = data.prompts.map(prompt => ({
      prompt: prompt.question,
      answer: prompt.answer,
    }))
    const choicesData = data.choices
      .filter(choice => choice.selected !== null && choice.selected !== undefined)
      .map((choice) => ({
        option_a: choice.optionA,
        option_b: choice.optionB,
        selected: choice.selected,
        question_index: choice.index,
      }))
    
    const existingPreferences = (existing?.preferences as any) || {}
    const updatedPreferences = {
      ...existingPreferences,
      min_age: data.minAge,
      max_age: data.maxAge,
      max_distance: data.maxDistance,
    }

    // Prepare profile data
    const profileData: any = {
      user_id: userId,
      name: existing?.name || '',
      interests: interestNames,
      prompts: promptsData,
      this_or_that_choices: choicesData,
      relationship_goals: data.goal,
      preferences: updatedPreferences,
      questionnaire_completed: true,
    }

    // Preserve other fields if profile exists
    if (existing) {
      profileData.photos = existing.photos || []
      profileData.setup_completed = existing.setup_completed || false
      profileData.preferences_completed = existing.preferences_completed || false
      profileData.video_url = existing.video_url || null
      profileData.video_file_name = existing.video_file_name || null
    } else {
      // Initialize fields for new profile
      profileData.photos = []
      profileData.setup_completed = false
      profileData.preferences_completed = false
    }

    // Update everything in one operation
    const { error } = await supabase
      .from('dating_profile_full')
      .upsert(profileData, { onConflict: 'user_id' })

    if (error) {
      console.error('Supabase error completing questionnaire:', error)
      throw error
    }

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
    const { data, error } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', userId)
      .single()

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
    const { data, error } = await supabase.rpc('get_dating_profile_completion_full', {
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
      .from('dating_profile_full')
      .select('photos, photo_prompts')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    // Transform photos array to legacy format
    const photos = (data?.photos as string[]) || []
    const photoPrompts = (data?.photo_prompts as string[]) || []
    const legacyPhotos: ProfilePhoto[] = photos.map((url, index) => ({
      id: `${userId}-${index}`,
      user_id: userId,
      photo_url: url,
      caption: photoPrompts[index] || "",
      display_order: index,
      is_primary: index === 0,
    }))

    return { success: true, data: legacyPhotos }
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
      .from('dating_profile_full')
      .select('preferences, user_id, id')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    const prefs = (data?.preferences as any) || {}
    
    // Transform to legacy format
    const legacyData: DatingPreference = {
      id: data.id,
      user_id: data.user_id,
      looking_for: prefs.looking_for || 'everyone',
      show_on_profile: prefs.show_on_profile ?? true,
      min_age: prefs.min_age,
      max_age: prefs.max_age,
      max_distance: prefs.max_distance,
    }

    return { success: true, data: legacyData }
  } catch (error: any) {
    console.error('Error getting dating preferences:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// LOCATION HELPERS
// ============================================

/**
 * Update the authenticated user's coordinates
 */
export async function updateUserLocation(latitude: number, longitude: number): Promise<ServiceResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('dating_profile_full')
      .update({
        latitude,
        longitude,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error updating user location:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch latitude/longitude for a user id
 */
export async function getUserLocation(userId: string): Promise<ServiceResponse<{ latitude: number | null; longitude: number | null }>> {
  try {
    const { data, error } = await supabase
      .from('dating_profile_full')
      .select('latitude, longitude')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return { success: true, data: { latitude: data.latitude ?? null, longitude: data.longitude ?? null } }
  } catch (error: any) {
    console.error('Error fetching user location:', error)
    return { success: false, error: error.message }
  }
}

