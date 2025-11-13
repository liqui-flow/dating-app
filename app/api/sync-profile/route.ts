/**
 * API Route to manually sync dob and gender from user_profiles to dating_profile_full
 * 
 * Usage: POST /api/sync-profile
 * This will sync the current user's dob and gender
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { syncDatingProfileFromUserProfile } from '@/lib/syncDatingProfile'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Sync the profile
    const result = await syncDatingProfileFromUserProfile(user.id)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error syncing profile:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

