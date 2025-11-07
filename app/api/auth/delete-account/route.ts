import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create supabase admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🗑️ Starting account deletion for user:', userId)

    // ============================================
    // STEP 1: Delete all files from storage buckets
    // ============================================
    
    const buckets = [
      'verification-documents',
      'face-scans',
      'profile-photos',
      'matrimony-photos',
      'profile-videos'
    ]

    for (const bucket of buckets) {
      try {
        console.log(`🗑️ Deleting files from bucket: ${bucket}`)
        
        // List all files for this user in the bucket
        const { data: files, error: listError } = await supabaseAdmin.storage
          .from(bucket)
          .list(userId, {
            limit: 1000,
            sortBy: { column: 'name', order: 'asc' }
          })

        if (listError) {
          console.warn(`⚠️ Error listing files in ${bucket}:`, listError.message)
          continue
        }

        if (files && files.length > 0) {
          // Delete all files for this user
          const filePaths = files.map(file => `${userId}/${file.name}`)
          const { error: deleteError } = await supabaseAdmin.storage
            .from(bucket)
            .remove(filePaths)

          if (deleteError) {
            console.warn(`⚠️ Error deleting files from ${bucket}:`, deleteError.message)
          } else {
            console.log(`✅ Deleted ${files.length} files from ${bucket}`)
          }
        } else {
          console.log(`ℹ️ No files found in ${bucket} for user ${userId}`)
        }
      } catch (bucketError: any) {
        console.warn(`⚠️ Error processing bucket ${bucket}:`, bucketError.message)
        // Continue with other buckets even if one fails
      }
    }

    // ============================================
    // STEP 2: Delete user from auth.users
    // This will CASCADE DELETE all related records due to ON DELETE CASCADE
    // ============================================
    
    console.log('🗑️ Deleting user from auth.users (this will cascade delete all related records)')
    
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('❌ Error deleting user:', deleteUserError)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to delete user account: ${deleteUserError.message}` 
        },
        { status: 500 }
      )
    }

    console.log('✅ User account deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted'
    })

  } catch (error: any) {
    console.error('❌ Account deletion error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete account' 
      },
      { status: 500 }
    )
  }
}

