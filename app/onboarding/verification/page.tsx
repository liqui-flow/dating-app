"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { VerificationScreen } from "@/components/onboarding/verification-screen"
import { PathSelect } from "@/components/onboarding/path-select"
import { ProfileSetup } from "@/components/onboarding/profile-setup"
import { DatingPreferences } from "@/components/onboarding/dating-preferences"
import { InterestQuestionnaire } from "@/components/onboarding/interest-questionnaire"
import { supabase } from "@/lib/supabaseClient"

type OnboardingStep = "verification" | "path-select" | "profile-setup" | "dating-preferences" | "questionnaire"
type PathMode = "dating" | "matrimony"

export default function VerificationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("verification")
  const [selectedPath, setSelectedPath] = useState<PathMode | null>(null)
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

  if (currentStep === "verification") {
    return (
      <VerificationScreen 
        onComplete={() => setCurrentStep("path-select")} 
        onSkip={() => setCurrentStep("path-select")}
      />
    )
  }

  if (currentStep === "path-select") {
    return (
      <PathSelect
        onSelect={(selected) => {
          setSelectedPath(selected)
          if (selected === "dating") {
            setCurrentStep("profile-setup")
          } else {
            // Navigate to matrimony setup
            router.push("/onboarding/matrimony-setup")
          }
        }}
        onBack={() => setCurrentStep("verification")}
      />
    )
  }

  if (currentStep === "profile-setup") {
    return (
      <ProfileSetup 
        onComplete={() => setCurrentStep("dating-preferences")} 
        onBack={() => setCurrentStep("path-select")} 
      />
    )
  }

  if (currentStep === "dating-preferences") {
    return (
      <DatingPreferences 
        onComplete={() => setCurrentStep("questionnaire")} 
        onBack={() => setCurrentStep("profile-setup")} 
      />
    )
  }

  if (currentStep === "questionnaire") {
    return (
      <InterestQuestionnaire 
        onComplete={async () => {
          // Mark onboarding as completed and redirect to dating dashboard
          const { data: { user } } = await supabase.auth.getUser()
          if (user && selectedPath) {
            const { completeOnboarding } = await import('@/lib/pathService')
            await completeOnboarding(user.id, selectedPath)
          }
          router.push("/dating/dashboard")
        }} 
      />
    )
  }

  return null
}


