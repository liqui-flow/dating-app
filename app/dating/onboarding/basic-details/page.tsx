"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProfileSetup } from "@/components/onboarding/profile-setup"
import { DatingPreferences } from "@/components/onboarding/dating-preferences"
import { AboutMyself } from "@/components/onboarding/about-myself"
import { InterestQuestionnaire } from "@/components/onboarding/interest-questionnaire"
import { supabase } from "@/lib/supabaseClient"
import { completeOnboarding } from "@/lib/pathService"

type OnboardingStep = "profile-setup" | "dating-preferences" | "about-myself" | "questionnaire"

export default function DatingBasicDetailsPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile-setup")
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated and onboarding status
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
          .select('onboarding_dating')
          .eq('user_id', user.id)
          .single()

        if (profile?.onboarding_dating === true) {
          // Already completed, redirect to discover
          router.push('/dating/dashboard')
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (currentStep === "profile-setup") {
    return (
      <ProfileSetup 
        onComplete={() => setCurrentStep("dating-preferences")} 
        onBack={() => router.push('/select-path')} 
      />
    )
  }

  if (currentStep === "dating-preferences") {
    return (
      <DatingPreferences 
        onComplete={() => setCurrentStep("about-myself")} 
        onBack={() => setCurrentStep("profile-setup")} 
      />
    )
  }

  if (currentStep === "about-myself") {
    return (
      <AboutMyself 
        onComplete={() => setCurrentStep("questionnaire")} 
        onBack={() => setCurrentStep("dating-preferences")} 
      />
    )
  }

  if (currentStep === "questionnaire") {
    return (
      <InterestQuestionnaire 
        onComplete={async () => {
          // Mark onboarding as completed and redirect to dating dashboard
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await completeOnboarding(user.id, "dating")
          }
          router.push("/dating/dashboard")
        }} 
      />
    )
  }

  return null
}

