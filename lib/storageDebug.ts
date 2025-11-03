/**
 * Storage Debug Helper
 * Use this to test if storage buckets and policies are working correctly
 */

import { supabase } from './supabaseClient'

export interface StorageTestResult {
  bucket: string
  canList: boolean
  canUpload: boolean
  canRead: boolean
  canDelete: boolean
  error?: string
}

/**
 * Test storage bucket permissions
 */
export async function testStorageBucket(bucketName: string): Promise<StorageTestResult> {
  const result: StorageTestResult = {
    bucket: bucketName,
    canList: false,
    canUpload: false,
    canRead: false,
    canDelete: false,
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      result.error = 'User not authenticated'
      return result
    }

    console.log(`\n🔍 Testing bucket: ${bucketName}`)
    console.log(`👤 User ID: ${user.id}`)

    // Test 1: List files (SELECT permission)
    try {
      const { data: listData, error: listError } = await supabase.storage
        .from(bucketName)
        .list(user.id)
      
      if (!listError) {
        result.canList = true
        console.log('✅ Can list files')
      } else {
        console.log('❌ Cannot list files:', listError.message)
      }
    } catch (e: any) {
      console.log('❌ Cannot list files:', e.message)
    }

    // Test 2: Upload a test file (INSERT permission)
    try {
      const testFileName = `${user.id}/test-${Date.now()}.txt`
      const testFile = new Blob(['test'], { type: 'text/plain' })
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(testFileName, testFile, { upsert: false })
      
      if (!uploadError) {
        result.canUpload = true
        console.log('✅ Can upload files')

        // Test 3: Read the file (SELECT permission)
        try {
          const { data: downloadData, error: downloadError } = await supabase.storage
            .from(bucketName)
            .download(testFileName)
          
          if (!downloadError) {
            result.canRead = true
            console.log('✅ Can read/download files')
          } else {
            console.log('❌ Cannot read files:', downloadError.message)
          }
        } catch (e: any) {
          console.log('❌ Cannot read files:', e.message)
        }

        // Test 4: Delete the test file (DELETE permission)
        try {
          const { error: deleteError } = await supabase.storage
            .from(bucketName)
            .remove([testFileName])
          
          if (!deleteError) {
            result.canDelete = true
            console.log('✅ Can delete files')
          } else {
            console.log('❌ Cannot delete files:', deleteError.message)
          }
        } catch (e: any) {
          console.log('❌ Cannot delete files:', e.message)
        }
      } else {
        console.log('❌ Cannot upload files:', uploadError.message)
        result.error = uploadError.message
      }
    } catch (e: any) {
      console.log('❌ Cannot upload files:', e.message)
      result.error = e.message
    }

  } catch (error: any) {
    result.error = error.message
    console.error('❌ Error testing bucket:', error)
  }

  return result
}

/**
 * Test all verification-related buckets
 */
export async function testAllVerificationBuckets() {
  console.log('🧪 Testing Storage Buckets...\n')
  
  const buckets = ['verification-documents', 'face-scans']
  const results: StorageTestResult[] = []

  for (const bucket of buckets) {
    const result = await testStorageBucket(bucket)
    results.push(result)
  }

  console.log('\n📊 Summary:')
  results.forEach(result => {
    console.log(`\n${result.bucket}:`)
    console.log(`  List: ${result.canList ? '✅' : '❌'}`)
    console.log(`  Upload: ${result.canUpload ? '✅' : '❌'}`)
    console.log(`  Read: ${result.canRead ? '✅' : '❌'}`)
    console.log(`  Delete: ${result.canDelete ? '✅' : '❌'}`)
    if (result.error) {
      console.log(`  Error: ${result.error}`)
    }
  })

  const allPassed = results.every(r => r.canUpload && r.canRead && r.canDelete)
  
  if (allPassed) {
    console.log('\n🎉 All storage tests passed!')
  } else {
    console.log('\n⚠️ Some storage tests failed. Please apply the storage policies from storage-policies.sql')
  }

  return results
}

/**
 * Quick storage health check
 */
export async function checkStorageHealth(): Promise<{
  healthy: boolean
  issues: string[]
}> {
  const issues: string[] = []
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      issues.push('User not authenticated')
      return { healthy: false, issues }
    }

    // Check verification-documents bucket
    const testFile = new Blob(['test'], { type: 'text/plain' })
    const testFileName = `${user.id}/health-check-${Date.now()}.txt`
    
    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(testFileName, testFile, { upsert: false })
    
    if (uploadError) {
      issues.push(`Cannot upload to verification-documents: ${uploadError.message}`)
    } else {
      // Clean up test file
      await supabase.storage
        .from('verification-documents')
        .remove([testFileName])
    }

    // Check face-scans bucket
    const testFileName2 = `${user.id}/health-check-${Date.now()}.txt`
    
    const { error: uploadError2 } = await supabase.storage
      .from('face-scans')
      .upload(testFileName2, testFile, { upsert: false })
    
    if (uploadError2) {
      issues.push(`Cannot upload to face-scans: ${uploadError2.message}`)
    } else {
      // Clean up test file
      await supabase.storage
        .from('face-scans')
        .remove([testFileName2])
    }

  } catch (error: any) {
    issues.push(`Storage health check failed: ${error.message}`)
  }

  return {
    healthy: issues.length === 0,
    issues
  }
}

