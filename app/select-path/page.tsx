"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PathSelect } from "@/components/onboarding/path-select"
import { supabase } from "@/lib/supabaseClient"
import { saveUserPath } from "@/lib/pathService"

export default function SelectPathPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not authenticated, redirect to auth
          router.push('/auth')
          return
        }

        // Check if user has completed onboarding
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        if (error || !profile) {
          // No profile found, redirect to onboarding
          router.push('/onboarding/verification')
          return
        }

        if (profile.onboarding_completed !== true) {
          // Onboarding not completed, redirect to onboarding
          router.push('/onboarding/verification')
          return
        }

        // User is authenticated and has completed onboarding, show path selection
        setIsCheckingAuth(false)
      } catch (err) {
        console.error('Error checking auth:', err)
        router.push('/auth')
      }
    }

    checkAuth()
  }, [router])

  const handlePathSelect = async (path: "dating" | "matrimony") => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth')
        return
      }

      // Update the path in the database
      await saveUserPath(user.id, path)

      // Redirect to the appropriate dashboard/discovery based on selected path
      if (path === 'dating') {
        router.push('/dating/dashboard')
      } else {
        router.push('/matrimony/discovery')
      }
    } catch (error) {
      console.error('Error selecting path:', error)
      // Still redirect even if save fails
      if (path === 'dating') {
        router.push('/dating/dashboard')
      } else {
        router.push('/matrimony/discovery')
      }
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <PathSelect
      onSelect={handlePathSelect}
    />
  )
}

