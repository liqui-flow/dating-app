"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles } from "lucide-react"
import { AuthScreen } from "@/components/auth/auth-screen"
import { VerificationScreen } from "@/components/onboarding/verification-screen"
import { InterestQuestionnaire } from "@/components/onboarding/interest-questionnaire"
import { PathSelect } from "@/components/onboarding/path-select"
import { MatrimonyOnboarding } from "@/components/profile/matrimony-onboarding"

type OnboardingStep =
  | "splash"
  | "auth"
  | "verification"
  | "path-select"
  | "questionnaire"
  | "matrimony-onboarding"
  | "complete"

interface SplashScreenProps {
  onComplete?: (mode?: "dating" | "matrimony") => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("splash")
  const [mode, setMode] = useState<"dating" | "matrimony">("dating")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setCurrentStep("auth")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleComplete = () => {
    if (onComplete) {
      onComplete(mode)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <h1 className="text-5xl font-bold text-black tracking-wide">Lovesathi.</h1>
      </div>
    )
  }

  // Step-based navigation through onboarding flow
  if (currentStep === "auth") {
    return <AuthScreen onAuthSuccess={() => setCurrentStep("verification")} />
  }

  if (currentStep === "verification") {
    return <VerificationScreen onComplete={() => setCurrentStep("path-select")} />
  }

  if (currentStep === "path-select") {
    return (
      <PathSelect
        onSelect={(selected) => {
          setMode(selected)
          setCurrentStep(selected === "dating" ? "questionnaire" : "matrimony-onboarding")
        }}
        onBack={() => setCurrentStep("verification")}
      />
    )
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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <h1 className="text-5xl font-bold text-black tracking-wide">Lovesathi</h1>
    </div>
  )
}
