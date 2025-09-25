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
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleComplete = () => {
    if (onComplete) {
      onComplete(mode)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-12 h-12 text-primary-foreground fill-current animate-pulse" />
            </div>
            <Sparkles className="w-6 h-6 text-secondary absolute -top-2 -right-2 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground font-sans">Lovesathi</h1>
            <p className="text-muted-foreground text-lg">Where hearts meet traditions</p>
          </div>
          <div className="w-8 h-8 mx-auto">
            <div className="w-full h-full border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold">Lovesathi</h1>
        <p className="text-muted-foreground">Find love your way</p>
        <Button onClick={() => setCurrentStep("auth")}>Get Started</Button>
      </div>
    </div>
  )
}
