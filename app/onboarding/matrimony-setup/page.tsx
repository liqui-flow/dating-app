"use client"

import React, { useEffect, useState } from "react"
import { MatrimonySetup } from "@/components/matrimony/matrimony-setup"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function MatrimonySetupPage() {
  const router = useRouter()
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)

  // Check if user already completed onboarding
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
          .select('selected_path, onboarding_completed')
          .eq('user_id', user.id)
          .single()

        if (!error && profile && profile.onboarding_completed) {
          // User already completed onboarding, redirect to appropriate dashboard
          if (profile.selected_path === 'dating') {
            router.push('/dating/dashboard')
          } else if (profile.selected_path === 'matrimony') {
            router.push('/matrimony/discovery')
          }
        } else {
          setIsCheckingProfile(false)
        }
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


