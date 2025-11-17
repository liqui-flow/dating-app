"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
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
]

export function MatrimonySetup() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  const progress = useMemo(() => ((step + 1) / stepTitles.length) * 100, [step])

  const onExit = () => {
    if (confirm("Exit setup? Your progress is saved as draft.")) {
      // In real impl, navigate away
      toast.message("You can return to complete your matrimony setup later.")
    }
  }

  const next = () => setStep((s) => Math.min(s + 1, stepTitles.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(/image 52.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <Card className="w-full max-w-4xl bg-white/10 border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-white rounded-[32px] relative z-10">
        <CardHeader className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-3xl font-semibold tracking-tight text-white">Matrimony Setup</CardTitle>
              <p className="text-sm text-white/70">Tell us about yourself so we can find the right matches.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="rounded-full px-4 bg-white/5 text-white border border-transparent hover:border-white/30 hover:bg-white/10 transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" /> Exit
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
              <span>
                Step {step + 1} of {stepTitles.length}
              </span>
              <span className="truncate text-white/80">{stepTitles[step]}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-white via-white to-white shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-8 space-y-8">
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


