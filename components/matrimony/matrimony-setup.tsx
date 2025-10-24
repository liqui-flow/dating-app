"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Save, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Step1WelcomeIdentity } from "@/components/matrimony/steps/Step1WelcomeIdentity"
import { Step2PersonalPhysical } from "@/components/matrimony/steps/Step2PersonalPhysical"
import { Step3CareerEducation } from "@/components/matrimony/steps/Step3CareerEducation"
import { Step4Family } from "@/components/matrimony/steps/Step4Family"
import { Step5CulturalAstro } from "@/components/matrimony/steps/Step5CulturalAstro"
import { Step6Bio } from "@/components/matrimony/steps/Step6Bio"
import { Step7PartnerPreferences } from "@/components/matrimony/steps/Step7PartnerPreferences"
import { MatrimonySetupProvider } from "@/components/matrimony/store"

// Step placeholders (implemented later)
function StepPlaceholder({ title }: { title: string }) {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      {title} — form coming next.
    </div>
  )
}

const stepTitles = [
  "Profile Setup & Basic Details",
  "About You",
  "Your Career & Education",
  "Family Information",
  "Your Cultural Details",
  "A Few Words About You",
  "Your Partner Preferences",
]

export function MatrimonySetup() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  const progress = useMemo(() => ((step + 1) / stepTitles.length) * 100, [step])

  const onSaveDraft = () => {
    toast.success("Draft saved")
  }

  const onExit = () => {
    if (confirm("Exit setup? Your progress is saved as draft.")) {
      // In real impl, navigate away
      toast.message("You can return to complete your matrimony setup later.")
    }
  }

  const next = () => setStep((s) => Math.min(s + 1, stepTitles.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Matrimony Setup</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onSaveDraft}>
                <Save className="w-4 h-4 mr-2" /> Save draft
              </Button>
              <Button variant="ghost" size="sm" onClick={onExit}>
                <X className="w-4 h-4 mr-2" /> Exit
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Step {step + 1} of {stepTitles.length}
              </span>
              <span>{stepTitles[step]}</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-8">
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
              <Step6Bio onNext={() => setStep(6)} onBack={() => setStep(4)} />
            )}
            {step === 6 && (
              <Step7PartnerPreferences onNext={() => {
                try {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("onboardingShowComplete", "true")
                    localStorage.setItem("onboardingCompleteMode", "matrimony")
                  }
                } catch {}
                toast.success("Matrimony setup complete")
                router.push("/")
              }} onBack={() => setStep(5)} />
            )}

          {false && (
            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" onClick={back} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={next}>
                {step === stepTitles.length - 1 ? "Finish" : (
                  <span className="flex items-center"><ChevronRight className="w-4 h-4 mr-2" /> Next</span>
                )}
              </Button>
            </div>
          )}
          </MatrimonySetupProvider>
        </CardContent>
      </Card>
    </div>
  )
}


