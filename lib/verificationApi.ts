/**
 * Verification API
 * Handles all database operations for user verification (DOB, Gender, ID)
 */

import { supabase } from './supabaseClient'

// ============================================
// TYPES
// ============================================

export interface UserProfile {
  id?: string
  user_id: string
  date_of_birth: string
  gender: 'male' | 'female' | 'prefer_not_to_say'
  created_at?: string
  updated_at?: string
}

export interface IDVerification {
  id?: string
  user_id: string
  document_type?: 'aadhar' | 'pan' | 'driving_license' | 'passport'
  document_file_url?: string
  document_file_name?: string
  document_file_size?: number
  face_scan_url?: string
  face_scan_file_name?: string
  face_scan_file_size?: number
  verification_status?: 'pending' | 'approved' | 'rejected' | 'in_review'
  verification_notes?: string
  verified_at?: string
  verified_by?: string
  created_at?: string
  updated_at?: string
}

export interface VerificationProgress {
  id?: string
  user_id: string
  dob_completed?: boolean
  dob_completed_at?: string
  gender_completed?: boolean
  gender_completed_at?: string
  id_verification_completed?: boolean
  id_verification_completed_at?: string
  all_steps_completed?: boolean
  completed_at?: string
  created_at?: string
  updated_at?: string
}

export interface VerificationStatus {
  has_profile: boolean
  has_verification: boolean
  verification_status: string
  progress_percentage: number
}

// ============================================
// USER PROFILE FUNCTIONS (DOB + Gender)
// ============================================

/**
 * Save or update user's date of birth
 */
export async function saveDateOfBirth(dob: string) {
  console.log('🔵 saveDateOfBirth called with DOB:', dob)
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      throw new Error('Authentication error: ' + authError.message)
    }
    
    if (!user) {
      console.error('❌ No user found')
      throw new Error('User not authenticated')
    }
    
    console.log('✅ User authenticated:', user.id)

    // Calculate age
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    // Validate age
    if (age < 17) {
      throw new Error('You must be at least 17 years old to use this app')
    }

    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle() // Use maybeSingle() to avoid error if no row exists

    let result

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('user_profiles')
        .update({ 
          date_of_birth: dob,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Insert new profile (without gender for now)
      result = await supabase
        .from('user_profiles')
        .insert({ 
          user_id: user.id,
          date_of_birth: dob,
          gender: 'prefer_not_to_say' // temporary default
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('❌ Error saving DOB to user_profiles:', result.error)
      console.error('Error details:', JSON.stringify(result.error, null, 2))
      throw result.error
    }
    
    console.log('✅ DOB saved to user_profiles:', result.data)

    // Always sync to dating_profile_full (create if doesn't exist)
    const { data: existingDatingProfile } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // Get user profile to check path
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('selected_path')
      .eq('user_id', user.id)
      .maybeSingle()

    // Sync to dating_profile_full if path is dating or not set yet
    if (existingDatingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('dating_profile_full')
        .update({ dob: dob })
        .eq('user_id', user.id)
      
      if (updateError) {
        console.warn('Warning: Could not update dating_profile_full:', updateError.message)
        // Don't throw - this is optional sync
      }
    } else if (!userProfile?.selected_path || userProfile?.selected_path === 'dating') {
      // Create new profile with dob (if user has selected dating path or path not set yet)
      const { error: insertError } = await supabase
        .from('dating_profile_full')
        .insert({
          user_id: user.id,
          name: '', // Will be set later
          dob: dob,
          interests: [],
          prompts: [],
          photos: [],
          preferences: {},
          this_or_that_choices: [],
        })
      
      if (insertError) {
        console.warn('Warning: Could not insert into dating_profile_full:', insertError.message)
        // Don't throw - this is optional sync, table might not exist yet
      }
    }

    // Update verification progress (don't fail if this errors)
    try {
      await updateVerificationProgress('dob_completed')
    } catch (progressError: any) {
      console.warn('Warning: Could not update verification progress:', progressError.message)
      // Don't throw - this is optional
    }

    return { success: true, data: result.data }
  } catch (error: any) {
    console.error('Error saving date of birth:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save or update user's gender
 */
export async function saveGender(gender: 'male' | 'female' | 'prefer_not_to_say') {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle() // Use maybeSingle() to avoid error if no row exists

    let result

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('user_profiles')
        .update({ 
          gender,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Insert new profile (this shouldn't happen if DOB was saved first)
      // But we handle it just in case
      const today = new Date()
      const defaultDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
      
      result = await supabase
        .from('user_profiles')
        .insert({ 
          user_id: user.id,
          date_of_birth: defaultDob.toISOString().split('T')[0],
          gender
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving gender to user_profiles:', result.error)
      throw result.error
    }

    // Convert gender format for dating (lowercase) and matrimony (capitalized)
    const genderValue = gender === 'prefer_not_to_say' ? null : gender
    const genderMatrimony = gender === 'prefer_not_to_say' ? null : (gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other')

    // Always sync to dating_profile_full (create if doesn't exist)
    const { data: existingDatingProfile } = await supabase
      .from('dating_profile_full')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingDatingProfile) {
      // Update existing profile
      await supabase
        .from('dating_profile_full')
        .update({ gender: genderValue })
        .eq('user_id', user.id)
    } else {
      // Create new profile with gender (if user has selected dating path)
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('selected_path, date_of_birth')
        .eq('user_id', user.id)
        .maybeSingle()

      if (userProfile?.selected_path === 'dating') {
        await supabase
          .from('dating_profile_full')
          .insert({
            user_id: user.id,
            name: '', // Will be set later
            dob: userProfile.date_of_birth || null,
            gender: genderValue,
            interests: [],
            prompts: [],
            photos: [],
            preferences: {},
            this_or_that_choices: [],
          })
      }
    }

    // Also sync to matrimony_profile_full if user has selected matrimony path
    const { data: userProfileForMatrimony } = await supabase
      .from('user_profiles')
      .select('selected_path, date_of_birth')
      .eq('user_id', user.id)
      .maybeSingle()

    if (userProfileForMatrimony?.selected_path === 'matrimony') {
      const { data: existingMatrimonyProfile } = await supabase
        .from('matrimony_profile_full')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingMatrimonyProfile) {
        // Update existing matrimony profile
        await supabase
          .from('matrimony_profile_full')
          .update({ gender: genderMatrimony })
          .eq('user_id', user.id)
      } else {
        // Create new matrimony profile with gender
        await supabase
          .from('matrimony_profile_full')
          .insert({
            user_id: user.id,
            name: '', // Will be set later
            gender: genderMatrimony,
            photos: [],
            personal: {},
            career: {},
            family: {},
            cultural: {
              date_of_birth: userProfileForMatrimony.date_of_birth || null,
            },
          })
      }
    }

    // Update verification progress (don't fail if this errors)
    try {
      await updateVerificationProgress('gender_completed')
    } catch (progressError: any) {
      console.warn('Warning: Could not update verification progress:', progressError.message)
      // Don't throw - this is optional
    }

    return { success: true, data: result.data }
  } catch (error: any) {
    console.error('Error saving gender:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting user profile:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// ID VERIFICATION FUNCTIONS
// ============================================

/**
 * Upload ID document to Supabase Storage
 */
export async function uploadIDDocument(file: File) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('🔄 Uploading ID document for user:', user.id)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/id-document-${Date.now()}.${fileExt}`

    console.log('📁 Upload path:', fileName)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Upload error:', error)
      throw new Error(`Storage upload failed: ${error.message}. Please check if storage policies are applied.`)
    }

    console.log('✅ Upload successful:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName)

    return { 
      success: true, 
      data: {
        path: data.path,
        url: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size
      }
    }
  } catch (error: any) {
    console.error('Error uploading ID document:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload face scan photo to Supabase Storage
 */
export async function uploadFaceScan(file: File) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('🔄 Uploading face scan for user:', user.id)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/face-scan-${Date.now()}.${fileExt}`

    console.log('📁 Upload path:', fileName)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('face-scans')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Upload error:', error)
      throw new Error(`Storage upload failed: ${error.message}. Please check if storage policies are applied.`)
    }

    console.log('✅ Upload successful:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('face-scans')
      .getPublicUrl(fileName)

    return { 
      success: true, 
      data: {
        path: data.path,
        url: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size
      }
    }
  } catch (error: any) {
    console.error('Error uploading face scan:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save ID verification data to database
 */
export async function saveIDVerification(
  idDocument: { url: string; fileName: string; fileSize: number },
  faceScan: { url: string; fileName: string; fileSize: number }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if verification record exists
    const { data: existingVerification } = await supabase
      .from('id_verifications')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let result

    const verificationData = {
      document_file_url: idDocument.url,
      document_file_name: idDocument.fileName,
      document_file_size: idDocument.fileSize,
      face_scan_url: faceScan.url,
      face_scan_file_name: faceScan.fileName,
      face_scan_file_size: faceScan.fileSize,
      verification_status: 'pending' as const,
      updated_at: new Date().toISOString()
    }

    if (existingVerification) {
      // Update existing verification
      result = await supabase
        .from('id_verifications')
        .update(verificationData)
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Insert new verification
      result = await supabase
        .from('id_verifications')
        .insert({ 
          user_id: user.id,
          ...verificationData
        })
        .select()
        .single()
    }

    if (result.error) throw result.error

    // Update verification progress
    await updateVerificationProgress('id_verification_completed')

    return { success: true, data: result.data }
  } catch (error: any) {
    console.error('Error saving ID verification:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get ID verification status
 */
export async function getIDVerification() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('id_verifications')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting ID verification:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// VERIFICATION PROGRESS FUNCTIONS
// ============================================

/**
 * Update verification progress
 */
export async function updateVerificationProgress(
  step: 'dob_completed' | 'gender_completed' | 'id_verification_completed'
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get existing progress (use maybeSingle to avoid error if table doesn't exist)
    const { data: existingProgress } = await supabase
      .from('verification_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const now = new Date().toISOString()
    let updateData: any = {
      [step]: true,
      [`${step}_at`]: now,
      updated_at: now
    }

    let result

    if (existingProgress) {
      // Check if all steps will be completed
      const allCompleted = 
        (step === 'dob_completed' || existingProgress.dob_completed) &&
        (step === 'gender_completed' || existingProgress.gender_completed) &&
        (step === 'id_verification_completed' || existingProgress.id_verification_completed)

      if (allCompleted) {
        updateData.all_steps_completed = true
        updateData.completed_at = now
      }

      // Update existing progress
      result = await supabase
        .from('verification_progress')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Insert new progress
      result = await supabase
        .from('verification_progress')
        .insert({ 
          user_id: user.id,
          ...updateData
        })
        .select()
        .single()
    }

    if (result.error) throw result.error

    return { success: true, data: result.data }
  } catch (error: any) {
    console.error('Error updating verification progress:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get verification progress
 */
export async function getVerificationProgress() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('verification_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting verification progress:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get overall verification status
 */
export async function getVerificationStatus(): Promise<{ success: boolean; data?: VerificationStatus; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Use the helper function from database
    const { data, error } = await supabase
      .rpc('get_user_verification_status', { p_user_id: user.id })

    if (error) throw error

    return { success: true, data: data?.[0] }
  } catch (error: any) {
    console.error('Error getting verification status:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// COMBINED SAVE FUNCTION
// ============================================

/**
 * Complete ID verification process (upload files and save to DB)
 */
export async function completeIDVerification(
  idDocumentFile: File,
  faceScanFile: File
) {
  try {
    // Upload ID document
    const idUploadResult = await uploadIDDocument(idDocumentFile)
    if (!idUploadResult.success) {
      throw new Error(`Failed to upload ID document: ${idUploadResult.error}`)
    }

    // Upload face scan
    const faceUploadResult = await uploadFaceScan(faceScanFile)
    if (!faceUploadResult.success) {
      throw new Error(`Failed to upload face scan: ${faceUploadResult.error}`)
    }

    // Save verification data
    const saveResult = await saveIDVerification(
      idUploadResult.data!,
      faceUploadResult.data!
    )

    if (!saveResult.success) {
      throw new Error(`Failed to save verification: ${saveResult.error}`)
    }

    return { 
      success: true, 
      data: saveResult.data,
      message: 'ID verification submitted successfully'
    }
  } catch (error: any) {
    console.error('Error completing ID verification:', error)
    return { success: false, error: error.message }
  }
}

