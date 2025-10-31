"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { VerificationScreen } from "@/components/onboarding/verification-screen"
import { PathSelect } from "@/components/onboarding/path-select"
import { ProfileSetup } from "@/components/onboarding/profile-setup"
import { DatingPreferences } from "@/components/onboarding/dating-preferences"
import { InterestQuestionnaire } from "@/components/onboarding/interest-questionnaire"

type OnboardingStep = "verification" | "path-select" | "profile-setup" | "dating-preferences" | "questionnaire"
type PathMode = "dating" | "matrimony"

export default function VerificationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("verification")
  const [selectedPath, setSelectedPath] = useState<PathMode | null>(null)

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
        onComplete={() => router.push("/")} 
      />
    )
  }

  return null
}


