"use client"

import React, { useEffect, useState } from "react"
import { MatrimonySetup } from "@/components/matrimony/matrimony-setup"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function MatrimonySetupPage() {
  const router = useRouter()
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)

  // Check if user already completed matrimony onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setIsCheckingProfile(false)
          return
        }

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('onboarding_matrimony')
          .eq('user_id', user.id)
          .single()

        // Use onboarding_matrimony field, not selected_path or onboarding_completed
        if (!error && profile && profile.onboarding_matrimony === true) {
          // User already completed matrimony onboarding, redirect to discovery
          router.push('/matrimony/discovery')
          return
        }
        
        // Not completed or error, show setup page
        setIsCheckingProfile(false)
      } catch (err) {
        console.error('Error checking onboarding status:', err)
        setIsCheckingProfile(false)
      }
    }

    checkOnboardingStatus()
  }, [router])

  if (isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return <MatrimonySetup />
}


