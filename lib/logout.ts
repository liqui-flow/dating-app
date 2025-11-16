import { supabase } from './supabaseClient'

/**
 * Properly handles user logout by:
 * 1. Signing out from Supabase
 * 2. Clearing all session data
 * 3. Redirecting to auth page
 */
export async function handleLogout(): Promise<void> {
  try {
    // Sign out from Supabase - this clears the session
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error)
      // Continue with logout even if there's an error
    }

    // Clear any additional session data from localStorage
    // Supabase stores session data in localStorage with keys like:
    // - sb-<project-ref>-auth-token
    // Clear all Supabase-related keys
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-')
    )
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key)
    })

    // Clear sessionStorage as well
    const sessionKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith('sb-')
    )
    sessionKeys.forEach(key => {
      sessionStorage.removeItem(key)
    })

    // Use replace instead of href to prevent back button issues
    // and ensure a clean redirect
    window.location.replace('/auth')
  } catch (error) {
    console.error('Unexpected error during logout:', error)
    // Even if there's an error, redirect to auth page
    window.location.replace('/auth')
  }
}

