"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function MatrimonyBasicDetailsPage() {
  const router = useRouter()

  // Check if user is authenticated and redirect to matrimony setup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth')
          return
        }

        // Check if onboarding is already completed
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_matrimony')
          .eq('user_id', user.id)
          .single()

        if (profile?.onboarding_matrimony === true) {
          // Already completed, redirect to discover
          router.push('/matrimony/discovery')
          return
        }

        // Redirect to matrimony setup page
        router.push('/onboarding/matrimony-setup')
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/onboarding/matrimony-setup')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  )
}

