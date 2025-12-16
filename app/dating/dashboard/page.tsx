"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppMain } from "@/components/app-main"
import { supabase } from "@/lib/supabaseClient"

export default function DatingDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkOnboarding = async () => {
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
          // No profile or error, redirect to onboarding
          router.push('/dating/onboarding/basic-details')
          return
        }

        if (profile.onboarding_dating !== true) {
          // Onboarding not completed, redirect to onboarding
          router.push('/dating/onboarding/basic-details')
          return
        }

        // Onboarding completed, show dashboard
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking onboarding:', error)
        router.push('/dating/onboarding/basic-details')
      }
    }

    checkOnboarding()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E0F12]">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return <AppMain />
}

