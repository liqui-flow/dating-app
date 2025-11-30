"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { VerificationScreen } from "@/components/onboarding/verification-screen"
import { PathSelect } from "@/components/onboarding/path-select"
import { ProfileSetup } from "@/components/onboarding/profile-setup"
import { AboutMyself } from "@/components/onboarding/about-myself"
import { DatingPreferences } from "@/components/onboarding/dating-preferences"
import { InterestQuestionnaire } from "@/components/onboarding/interest-questionnaire"
import { supabase } from "@/lib/supabaseClient"

type OnboardingStep = "verification" | "path-select" | "profile-setup" | "about-myself" | "dating-preferences" | "questionnaire"
type PathMode = "dating" | "matrimony"

export default function VerificationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("verification")
  const [selectedPath, setSelectedPath] = useState<PathMode | null>(null)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Check if user already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth')
          return
        }

        // Check if email is verified first
        if (!user.email_confirmed_at) {
          console.log('Email not verified, redirecting to email verification')
          router.push('/auth/verify-email')
          return
        }

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('selected_path, onboarding_completed')
          .eq('user_id', user.id)
          .single()

        // Check if onboarding is completed (explicitly true)
        if (!error && profile && profile.onboarding_completed === true) {
          console.log('Onboarding already completed, redirecting to path selection...', { 
            selected_path: profile.selected_path,
            onboarding_completed: profile.onboarding_completed 
          })
          
          // Set redirect flag and redirect to path selection
          setShouldRedirect(true)
          router.replace('/select-path')
          return
        }

        // Fallback: Check if user has completed profiles even if onboarding_completed is not set
        // This handles cases where accounts were created but onboarding_completed wasn't updated
        if (!error && profile && profile.selected_path) {
          let hasCompletedProfile = false
          
          if (profile.selected_path === 'dating') {
            // Check if dating profile is completed
            const { data: datingProfile } = await supabase
              .from('dating_profile_full')
              .select('questionnaire_completed')
              .eq('user_id', user.id)
              .single()
            
            if (datingProfile && datingProfile.questionnaire_completed) {
              hasCompletedProfile = true
              // Auto-fix: Update onboarding_completed
              await supabase
                .from('user_profiles')
                .update({ 
                  onboarding_completed: true,
                  onboarding_completed_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
            }
          } else if (profile.selected_path === 'matrimony') {
            // Check if matrimony profile is completed
            const { data: matrimonyProfile } = await supabase
              .from('matrimony_profile_full')
              .select('profile_completed')
              .eq('user_id', user.id)
              .single()
            
            if (matrimonyProfile && matrimonyProfile.profile_completed) {
              hasCompletedProfile = true
              // Auto-fix: Update onboarding_completed
              await supabase
                .from('user_profiles')
                .update({ 
                  onboarding_completed: true,
                  onboarding_completed_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
            }
          }
          
          if (hasCompletedProfile) {
            console.log('Found completed profile, auto-fixing onboarding_completed and redirecting to path selection...')
            setShouldRedirect(true)
            router.replace('/select-path')
            return
          }
        }
        
        // Log if there's an error or profile not found
        if (error) {
          console.log('Profile check error (user may not have profile yet):', error.code)
        } else if (profile && profile.onboarding_completed !== true) {
          console.log('Onboarding not completed yet:', { 
            onboarding_completed: profile.onboarding_completed,
            selected_path: profile.selected_path 
          })
        }
        
        setIsCheckingProfile(false)
      } catch (err) {
        console.error('Error checking onboarding status:', err)
        setIsCheckingProfile(false)
      }
    }

    checkOnboardingStatus()
  }, [router])

  // Show loading while checking, or nothing if redirecting
  if (isCheckingProfile || shouldRedirect) {
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


