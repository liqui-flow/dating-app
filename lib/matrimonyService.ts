import { supabase } from './supabaseClient'
import type { MatrimonyProfile, MatrimonyPreferences, VerificationPayload } from "@/lib/types"

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

type Draft = {
  profile?: Partial<MatrimonyProfile>
  preferences?: Partial<MatrimonyPreferences>
  verification?: Partial<VerificationPayload>
}

const DRAFT_KEY = "matrimony_draft_v1"

// ============================================
// DRAFT MANAGEMENT (Local Storage)
// ============================================

export async function saveDraft(draft: Draft) {
  if (typeof window === "undefined") return
  const existing = (JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") as Draft) || {}
  const merged = { ...existing, ...draft }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(merged))
}

export async function loadDraft(): Promise<Draft | null> {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(DRAFT_KEY)
  return raw ? (JSON.parse(raw) as Draft) : null
}

export async function clearDraft() {
  if (typeof window === "undefined") return
  localStorage.removeItem(DRAFT_KEY)
}

// ============================================
// FILE UPLOAD
// ============================================

/**
 * Upload photo to Supabase Storage
 */
export async function uploadAsset(file: File): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('matrimony-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('matrimony-photos')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error: any) {
    console.error('Error uploading asset:', error)
    // Fallback to object URL for development
    return URL.createObjectURL(file)
  }
}

// ============================================
// STEP 1: WELCOME & IDENTITY
// ============================================

/**
 * Save Step 1: Basic profile info and photos
 */
export async function saveStep1(
  userId: string,
  data: {
    name: string
    age: number
    gender: 'Male' | 'Female' | 'Other'
    createdBy: 'Self' | 'Parent' | 'Sibling' | 'Other'
    photoUrls: string[]
  }
): Promise<ServiceResponse> {
  try {
    // Save/update main profile
    const { error: profileError } = await supabase
      .from('matrimony_profiles')
      .upsert(
        {
          user_id: userId,
          name: data.name,
          age: data.age,
          gender: data.gender,
          created_by: data.createdBy,
          step1_completed: true,
        },
        { onConflict: 'user_id' }
      )

    if (profileError) throw profileError

    // Delete existing photos
    await supabase
      .from('matrimony_photos')
      .delete()
      .eq('user_id', userId)

    // Insert new photos
    if (data.photoUrls.length > 0) {
      const photosData = data.photoUrls.map((url, index) => ({
        user_id: userId,
        photo_url: url,
        display_order: index,
        is_primary: index === 0,
      }))

      const { error: photosError } = await supabase
        .from('matrimony_photos')
        .insert(photosData)

      if (photosError) throw photosError
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error saving step 1:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// STEP 2: PERSONAL & PHYSICAL DETAILS
// ============================================

/**
 * Save Step 2: Personal and physical details
 */
export async function saveStep2(
  userId: string,
  data: {
    heightCm: number
    heightUnit?: string
    complexion?: string
    bodyType?: string
    diet?: string
    smoker?: boolean
    drinker?: boolean
    maritalStatus: string
  }
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('matrimony_personal_details')
      .upsert(
        {
          user_id: userId,
          height_cm: data.heightCm,
          height_unit: data.heightUnit || 'cm',
          complexion: data.complexion,
          body_type: data.bodyType,
          diet: data.diet,
          smoker: data.smoker || false,
          drinker: data.drinker || false,
          marital_status: data.maritalStatus,
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    // Update completion flag
    await supabase
      .from('matrimony_profiles')
      .update({ step2_completed: true })
      .eq('user_id', userId)

    return { success: true }
  } catch (error: any) {
    console.error('Error saving step 2:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// STEP 3: CAREER & EDUCATION
// ============================================

/**
 * Save Step 3: Career and education details
 */
export async function saveStep3(
  userId: string,
  data: {
    highestEducation: string
    college?: string
    jobTitle: string
    company?: string
    annualIncome: string
    workLocation: { city?: string; state?: string; country?: string }
  }
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('matrimony_career_education')
      .upsert(
        {
          user_id: userId,
          highest_education: data.highestEducation,
          college: data.college,
          job_title: data.jobTitle,
          company: data.company,
          annual_income: data.annualIncome,
          work_city: data.workLocation.city,
          work_state: data.workLocation.state,
          work_country: data.workLocation.country,
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    // Update completion flag
    await supabase
      .from('matrimony_profiles')
      .update({ step3_completed: true })
      .eq('user_id', userId)

    return { success: true }
  } catch (error: any) {
    console.error('Error saving step 3:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// STEP 4: FAMILY INFORMATION
// ============================================

/**
 * Save Step 4: Family information
 */
export async function saveStep4(
  userId: string,
  data: {
    familyType?: string
    familyValues?: string
    fatherOccupation?: string
    fatherCompany?: string
    motherOccupation?: string
    motherCompany?: string
    brothers?: number
    sisters?: number
    siblingsMarried?: string
    showOnProfile?: boolean
  }
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('matrimony_family_info')
      .upsert(
        {
          user_id: userId,
          family_type: data.familyType,
          family_values: data.familyValues,
          father_occupation: data.fatherOccupation,
          father_company: data.fatherCompany,
          mother_occupation: data.motherOccupation,
          mother_company: data.motherCompany,
          brothers: data.brothers || 0,
          sisters: data.sisters || 0,
          siblings_married: data.siblingsMarried,
          show_on_profile: data.showOnProfile || false,
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    // Update completion flag
    await supabase
      .from('matrimony_profiles')
      .update({ step4_completed: true })
      .eq('user_id', userId)

    return { success: true }
  } catch (error: any) {
    console.error('Error saving step 4:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// STEP 5: CULTURAL & RELIGIOUS DETAILS
// ============================================

/**
 * Save Step 5: Cultural and religious details
 */
export async function saveStep5(
  userId: string,
  data: {
    religion: string
    motherTongue: string
    community: string
    subCaste?: string
    dob: string
    tob: string
    pob: string
    star?: string
    gotra?: string
  }
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('matrimony_cultural_details')
      .upsert(
        {
          user_id: userId,
          religion: data.religion,
          mother_tongue: data.motherTongue,
          community: data.community,
          sub_caste: data.subCaste,
          date_of_birth: data.dob,
          time_of_birth: data.tob,
          place_of_birth: data.pob,
          star_raashi: data.star,
          gotra: data.gotra,
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    // Update completion flag
    await supabase
      .from('matrimony_profiles')
      .update({ step5_completed: true })
      .eq('user_id', userId)

    return { success: true }
  } catch (error: any) {
    console.error('Error saving step 5:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// STEP 6: BIO
// ============================================

/**
 * Save Step 6: Personal bio
 */
export async function saveStep6(
  userId: string,
  bio: string
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('matrimony_bio')
      .upsert(
        {
          user_id: userId,
          bio: bio,
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    // Update completion flag
    await supabase
      .from('matrimony_profiles')
      .update({ step6_completed: true })
      .eq('user_id', userId)

    return { success: true }
  } catch (error: any) {
    console.error('Error saving step 6:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// STEP 7: PARTNER PREFERENCES
// ============================================

/**
 * Save Step 7: Partner preferences
 */
export async function saveStep7(
  userId: string,
  data: {
    ageRange: [number, number]
    heightRangeCm: [number, number]
    dietPrefs?: string[]
    lifestylePrefs?: string[]
    educationPrefs?: string[]
    professionPrefs?: string[]
    locations?: string[]
    communities?: string[]
    familyTypePrefs?: string[]
  }
): Promise<ServiceResponse> {
  try {
    // Save age and height preferences
    const { error: prefError } = await supabase
      .from('matrimony_partner_preferences')
      .upsert(
        {
          user_id: userId,
          min_age: data.ageRange[0],
          max_age: data.ageRange[1],
          min_height_cm: data.heightRangeCm[0],
          max_height_cm: data.heightRangeCm[1],
        },
        { onConflict: 'user_id' }
      )

    if (prefError) throw prefError

    // Delete existing preference details
    await supabase
      .from('matrimony_preference_details')
      .delete()
      .eq('user_id', userId)

    // Prepare array preferences
    const prefDetails: any[] = []

    if (data.dietPrefs) {
      data.dietPrefs.forEach(val => {
        prefDetails.push({ user_id: userId, preference_type: 'diet', preference_value: val })
      })
    }

    if (data.lifestylePrefs) {
      data.lifestylePrefs.forEach(val => {
        prefDetails.push({ user_id: userId, preference_type: 'lifestyle', preference_value: val })
      })
    }

    if (data.educationPrefs) {
      data.educationPrefs.forEach(val => {
        prefDetails.push({ user_id: userId, preference_type: 'education', preference_value: val })
      })
    }

    if (data.professionPrefs) {
      data.professionPrefs.forEach(val => {
        prefDetails.push({ user_id: userId, preference_type: 'profession', preference_value: val })
      })
    }

    if (data.locations) {
      data.locations.forEach(val => {
        prefDetails.push({ user_id: userId, preference_type: 'location', preference_value: val })
      })
    }

    if (data.communities) {
      data.communities.forEach(val => {
        prefDetails.push({ user_id: userId, preference_type: 'community', preference_value: val })
      })
    }

    if (data.familyTypePrefs) {
      data.familyTypePrefs.forEach(val => {
        prefDetails.push({ user_id: userId, preference_type: 'family_type', preference_value: val })
      })
    }

    // Insert new preference details
    if (prefDetails.length > 0) {
      const { error: detailsError } = await supabase
        .from('matrimony_preference_details')
        .insert(prefDetails)

      if (detailsError) throw detailsError
    }

    // Update completion flags
    await supabase
      .from('matrimony_profiles')
      .update({ 
        step7_completed: true,
        profile_completed: true 
      })
      .eq('user_id', userId)

    return { success: true }
  } catch (error: any) {
    console.error('Error saving step 7:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// PROFILE SUBMISSION
// ============================================

export async function submitProfile(payload: {
  profile: MatrimonyProfile
  preferences: MatrimonyPreferences
  verification?: VerificationPayload
}) {
  // Profile is already saved step-by-step
  // This function can be used for final validation or additional processing
  console.log("Matrimony profile completed:", payload)
  await clearDraft()
  return { ok: true }
}

// ============================================
// RETRIEVAL FUNCTIONS
// ============================================

/**
 * Get complete matrimony profile
 */
export async function getMatrimonyProfile(userId: string): Promise<ServiceResponse> {
  try {
    const { data, error } = await supabase.rpc('get_complete_matrimony_profile', {
      p_user_id: userId,
    })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting matrimony profile:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get profile completion status
 */
export async function getProfileCompletion(userId: string): Promise<ServiceResponse> {
  try {
    const { data, error } = await supabase.rpc('get_matrimony_profile_completion', {
      p_user_id: userId,
    })

    if (error) throw error

    return { success: true, data: data?.[0] || null }
  } catch (error: any) {
    console.error('Error getting profile completion:', error)
    return { success: false, error: error.message }
  }
}


