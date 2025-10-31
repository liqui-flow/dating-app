"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { AuthScreen } from "@/components/auth/auth-screen"
import { VerificationScreen } from "@/components/onboarding/verification-screen"
import { InterestQuestionnaire } from "@/components/onboarding/interest-questionnaire"
import { PathSelect } from "@/components/onboarding/path-select"
import { useRouter } from "next/navigation"
import { ProfileSetup } from "@/components/onboarding/profile-setup"
import { DatingPreferences } from "@/components/onboarding/dating-preferences"
import { MatrimonyOnboarding } from "@/components/profile/matrimony-onboarding"

type OnboardingStep =
  | "splash"
  | "auth"
  | "verification"
  | "path-select"
  | "profile-setup"
  | "dating-preferences"
  | "questionnaire"
  | "matrimony-onboarding"
  | "complete"

interface SplashScreenProps {
  onComplete?: (mode?: "dating" | "matrimony") => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const router = useRouter()
  
  // Check for immediate navigation flags first
  const showPathSelect = typeof window !== "undefined" ? localStorage.getItem("showPathSelect") : null
  const completeMode = typeof window !== "undefined" ? localStorage.getItem("onboardingCompleteMode") as "dating" | "matrimony" | null : null
  const showComplete = typeof window !== "undefined" ? localStorage.getItem("onboardingShowComplete") : null
  
  const [isLoading, setIsLoading] = useState(!showPathSelect && !showComplete)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    showPathSelect ? "path-select" : 
    showComplete ? "complete" : 
    "splash"
  )
  const [mode, setMode] = useState<"dating" | "matrimony">("dating")

  useEffect(() => {
    try {
      if (completeMode && showComplete) {
        localStorage.removeItem("onboardingShowComplete")
        onComplete?.(completeMode)
        return
      }
      
      if (showPathSelect) {
        localStorage.removeItem("showPathSelect")
        setCurrentStep("path-select")
        setIsLoading(false)
        return
      }
    } catch {}
  }, [onComplete, showPathSelect, showComplete, completeMode])

  useEffect(() => {
    if (!showPathSelect && !showComplete) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        setCurrentStep("auth")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [showPathSelect, showComplete])

  const handleComplete = () => {
    if (onComplete) {
      onComplete(mode)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/Video.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        
        {/* Content */}
        <h1 className="text-5xl font-bold text-white tracking-wide relative z-20 drop-shadow-lg">
          Lovesathi.
        </h1>
      </div>
    )
  }

  // Step-based navigation through onboarding flow
  if (currentStep === "auth") {
    return <AuthScreen onAuthSuccess={() => setCurrentStep("verification")} />
  }

  if (currentStep === "verification") {
    return <VerificationScreen 
      onComplete={() => setCurrentStep("path-select")} 
      onSkip={() => setCurrentStep("path-select")}
    />
  }

  if (currentStep === "path-select") {
    return (
      <PathSelect
        onSelect={(selected) => {
          setMode(selected)
          if (selected === "dating") {
            setCurrentStep("profile-setup")
          } else {
            router.push("/onboarding/matrimony-setup")
          }
        }}
        onBack={() => setCurrentStep("verification")}
      />
    )
  }

  if (currentStep === "profile-setup") {
    return <ProfileSetup onComplete={() => setCurrentStep("dating-preferences")} onBack={() => setCurrentStep("path-select")} />
  }

  if (currentStep === "dating-preferences") {
    return <DatingPreferences onComplete={() => setCurrentStep("questionnaire")} onBack={() => setCurrentStep("profile-setup")} />
  }

  if (currentStep === "questionnaire") {
    return <InterestQuestionnaire onComplete={() => setCurrentStep("complete")} />
  }

  if (currentStep === "matrimony-onboarding") {
    return <MatrimonyOnboarding onComplete={() => setCurrentStep("complete")} />
  }

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">You're all set!</h2>
          <p className="text-muted-foreground">Enjoy your experience.</p>
          <Button onClick={handleComplete}>Enter App</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/Video.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      {/* Content */}
      <h1 className="text-5xl font-bold text-white tracking-wide relative z-20 drop-shadow-lg">
        Lovesathi
      </h1>
    </div>
  )
}
