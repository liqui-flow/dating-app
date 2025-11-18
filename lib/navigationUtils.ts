import { supabase } from './supabaseClient'

/**
 * Navigate to dating based on onboarding status
 * If onboarding_dating is true, go to discover
 * Otherwise, go to first onboarding step
 */
export async function goToDating(router: { push: (path: string) => void }) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('onboarding_dating')
      .eq('user_id', user.id)
      .single()

    if (error || !profile) {
      // No profile or error, go to onboarding
      router.push('/dating/onboarding/basic-details')
      return
    }

    if (profile.onboarding_dating === true) {
      router.push('/dating/dashboard')
    } else {
      // Go to dating onboarding first step
      router.push('/dating/onboarding/basic-details')
    }
  } catch (error) {
    console.error('Error navigating to dating:', error)
    // On error, default to onboarding
    router.push('/dating/onboarding/basic-details')
  }
}

/**
 * Navigate to matrimony based on onboarding status
 * If onboarding_matrimony is EXACTLY true, go to discover
 * Otherwise (false, null, undefined), go to first onboarding step
 */
export async function goToMatrimony(router: { push: (path: string) => void }) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('onboarding_matrimony')
      .eq('user_id', user.id)
      .single()

    // If error or no profile, go to onboarding
    if (error || !profile) {
      console.log('No profile or error fetching profile, redirecting to matrimony onboarding:', error?.message)
      router.push('/matrimony/onboarding/basic-details')
      return
    }

    // Explicitly check for TRUE only - not truthy, must be exactly true
    if (profile.onboarding_matrimony === true) {
      router.push('/matrimony/discovery')
    } else {
      // onboarding_matrimony is false, null, or undefined - go to onboarding
      console.log('onboarding_matrimony is not true, redirecting to onboarding:', profile.onboarding_matrimony)
      router.push('/matrimony/onboarding/basic-details')
    }
  } catch (error) {
    console.error('Error navigating to matrimony:', error)
    // On error, default to onboarding
    router.push('/matrimony/onboarding/basic-details')
  }
}

