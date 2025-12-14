"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Step1WelcomeIdentity } from "@/components/matrimony/steps/Step1WelcomeIdentity"
import { Step2PersonalPhysical } from "@/components/matrimony/steps/Step2PersonalPhysical"
import { Step3CareerEducation } from "@/components/matrimony/steps/Step3CareerEducation"
import { Step4Family } from "@/components/matrimony/steps/Step4Family"
import { Step5CulturalAstro } from "@/components/matrimony/steps/Step5CulturalAstro"
import { Step6Bio } from "@/components/matrimony/steps/Step6Bio"
import { MatrimonySetupProvider } from "@/components/matrimony/store"
import { supabase } from "@/lib/supabaseClient"
import { completeOnboarding } from "@/lib/pathService"

const stepTitles = [
  "Profile Setup & Basic Details",
  "About You",
  "Your Career & Education",
  "Family Information",
  "Your Cultural Details",
  "A Few Words About You",
]

export function MatrimonySetup() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  const onExit = () => {
    if (confirm("Exit setup? Your progress is saved as draft.")) {
      toast.message("You can return to complete your matrimony setup later.")
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with exit button and progress */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-black/10">
        <button
          onClick={onExit}
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-black" />
        </button>
        <div className="flex items-center gap-2">
          {stepTitles.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === step
                  ? "w-8 bg-[#97011A]"
                  : index < step
                  ? "w-2 bg-[#97011A]"
                  : "w-2 bg-black/20"
              }`}
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl w-full mx-auto">
        <MatrimonySetupProvider>
          {step === 0 && (
            <Step1WelcomeIdentity onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <Step2PersonalPhysical onNext={() => setStep(2)} onBack={() => setStep(0)} />
          )}
          {step === 2 && (
            <Step3CareerEducation onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <Step4Family onNext={() => setStep(4)} onBack={() => setStep(2)} />
          )}
          {step === 4 && (
            <Step5CulturalAstro onNext={() => setStep(5)} onBack={() => setStep(3)} />
          )}
          {step === 5 && (
            <Step6Bio onNext={async () => {
              try {
                // Mark onboarding as completed
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                  await completeOnboarding(user.id, "matrimony")
                }
                toast.success("Matrimony setup complete")
                router.push("/matrimony/discovery")
              } catch (error) {
                console.error("Error completing matrimony onboarding:", error)
                toast.error("Failed to complete setup")
              }
            }} onBack={() => setStep(4)} />
          )}
        </MatrimonySetupProvider>
      </div>
    </div>
  )
}


