"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles } from "lucide-react"
import { AuthScreen } from "@/components/auth/auth-screen"
import { VerificationScreen } from "@/components/onboarding/verification-screen"
import { InterestQuestionnaire } from "@/components/onboarding/interest-questionnaire"

type OnboardingStep = "splash" | "auth" | "verification" | "questionnaire" | "complete"

interface SplashScreenProps {
  onComplete?: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("splash")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
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
            <h1 className="text-4xl font-bold text-foreground font-sans">HeartConnect</h1>
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
    return <VerificationScreen onComplete={() => setCurrentStep("questionnaire")} />
  }

  if (currentStep === "questionnaire") {
    return <InterestQuestionnaire onComplete={() => setCurrentStep("complete")} />
  }

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary-foreground fill-current" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Welcome to HeartConnect!</h1>
            <p className="text-muted-foreground">Your profile is ready. Let's find your perfect match.</p>
          </div>
          <Button size="lg" className="px-8" onClick={handleComplete}>
            Start Discovering
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-sans">HeartConnect</h1>
        </div>
        <p className="text-muted-foreground text-lg">Where hearts meet traditions</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-semibold text-foreground text-balance">Find your perfect match</h2>
          <p className="text-muted-foreground text-balance leading-relaxed">
            Connect with like-minded individuals who share your values and are ready for meaningful relationships.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <Button
            className="btn-glass btn-glass-purple w-full h-12 text-lg font-medium"
            size="lg"
            onClick={() => setCurrentStep("auth")}
          >
            Get Started
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground max-w-xs">
          <p>
            By continuing, you agree to our <span className="text-primary underline">Terms of Service</span> and{" "}
            <span className="text-primary underline">Privacy Policy</span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-muted-foreground">© 2024 HeartConnect. All rights reserved.</p>
      </footer>
    </div>
  )
}
