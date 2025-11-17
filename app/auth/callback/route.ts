import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check user profile for onboarding status
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('selected_path, onboarding_completed')
        .eq('user_id', user.id)
        .single()

      if (error || !profile) {
        console.log('No profile found, sending to onboarding')
        return NextResponse.redirect(new URL('/onboarding/verification', requestUrl.origin))
      }

      // Check if onboarding is explicitly completed (true)
      if (profile.onboarding_completed !== true) {
        console.log('Onboarding not completed, sending to verification:', { 
          onboarding_completed: profile.onboarding_completed 
        })
        return NextResponse.redirect(new URL('/onboarding/verification', requestUrl.origin))
      }

      if (profile.selected_path === 'dating') {
        return NextResponse.redirect(new URL('/dating/dashboard', requestUrl.origin))
      }

      if (profile.selected_path === 'matrimony') {
        return NextResponse.redirect(new URL('/matrimony/discovery', requestUrl.origin))
      }

      // fallback
      return NextResponse.redirect(new URL('/onboarding/verification', requestUrl.origin))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/onboarding/verification', requestUrl.origin))
}

