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
import { AboutMyself } from "@/components/onboarding/about-myself"
import { DatingPreferences } from "@/components/onboarding/dating-preferences"
import { MatrimonyOnboarding } from "@/components/profile/matrimony-onboarding"

type OnboardingStep =
  | "splash"
  | "auth"
  | "verification"
  | "path-select"
  | "profile-setup"
  | "about-myself"
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
  const [visibleLetters, setVisibleLetters] = useState(0)
  
  const text = "Lovesathi"
  const letters = text.split("")

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

  // Letter-by-letter animation - smooth cursive flow
  useEffect(() => {
    if (isLoading && !showPathSelect && !showComplete) {
      const letterInterval = setInterval(() => {
        setVisibleLetters((prev) => {
          if (prev < letters.length) {
            return prev + 1
          } else {
            clearInterval(letterInterval)
            return prev
          }
        })
      }, 120) // Smooth cursive flow timing

      return () => clearInterval(letterInterval)
    }
  }, [isLoading, showPathSelect, showComplete, letters.length])

  useEffect(() => {
    if (!showPathSelect && !showComplete) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        setCurrentStep("auth")
      }, 4000)

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
      <div 
        className="overflow-hidden flex items-center justify-center relative"
        style={{
          width: '100%',
          height: '100vh',
          backgroundImage: 'url(/assets/image52.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <h1 
          className="text-[#E0E0E0] relative z-10 flex"
          style={{
            fontFamily: 'var(--font-script)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          {letters.map((letter, index) => {
            const isVisible = index < visibleLetters
            const progress = isVisible ? 1 : 0
            
            return (
              <span
                key={index}
                style={{
                  opacity: progress,
                  transform: `translateX(${(1 - progress) * -15}px) scale(${0.85 + progress * 0.15})`,
                  transition: 'opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.8)',
                  WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.3)',
                  display: 'inline-block',
                  willChange: 'opacity, transform',
                }}
              >
                {letter}
              </span>
            )
          })}
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
    return <DatingPreferences onComplete={() => setCurrentStep("about-myself")} onBack={() => setCurrentStep("profile-setup")} />
  }

  if (currentStep === "about-myself") {
    return <AboutMyself onComplete={() => setCurrentStep("questionnaire")} onBack={() => setCurrentStep("dating-preferences")} />
  }

  if (currentStep === "questionnaire") {
    return <InterestQuestionnaire onComplete={() => setCurrentStep("complete")} />
  }

  if (currentStep === "matrimony-onboarding") {
    return <MatrimonyOnboarding onComplete={() => setCurrentStep("complete")} />
  }

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">You're all set!</h2>
          <p className="text-muted-foreground">Enjoy your experience.</p>
          <Button onClick={handleComplete}>Enter App</Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="overflow-hidden flex items-center justify-center relative"
      style={{
        width: '100%',
        height: '100vh',
        backgroundImage: 'url(/assets/image52.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <h1 
        className="text-[#E0E0E0] relative z-10 flex"
        style={{
          fontFamily: 'var(--font-script)',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}
      >
        {letters.map((letter, index) => (
          <span
            key={index}
            style={{
              opacity: index < visibleLetters ? 1 : 0,
              transform: index < visibleLetters ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.8)',
              WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.3)',
            }}
          >
            {letter}
          </span>
        ))}
      </h1>
    </div>
  )
}

