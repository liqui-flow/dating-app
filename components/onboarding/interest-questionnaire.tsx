"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart, Palette, UtensilsCrossed, Film, Sparkles, Calendar, Zap, MapPin } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { completeQuestionnaire } from "@/lib/datingProfileService"
import { useToast } from "@/hooks/use-toast"

interface InterestQuestionnaireProps {
  onComplete?: () => void
}

// Data sets
const interestCategories = {
  Art: ["Painting", "Photography", "Digital Art", "Sculpture", "Sketching"],
  Food: ["Foodie", "Cooking", "Trying new restaurants", "Baking", "Food photography"],
  Entertainment: ["Netflix nights", "YouTube rabbit holes", "Podcasts", "Reels & TikTok", "Live shows"],
  Lifestyle: ["Thrifting", "DIY Projects", "Volunteering", "Wellness", "Homebody"],
  "Weekend mood": ["Chill & recharge", "Spontaneous plans", "Friends & fun", "Solo reset", "Mix of everything"],
  "Dating vibes": ["Quality time", "Deep conversations", "Casual coffee dates", "Slow burn", "Spontaneous plans"],
  "Dating energy": ["Golden retriever energy", "Calm & grounded", "Introvert at first", "Extrovert energy", "Depends on the vibe"],
  "Travel style": ["Road trips", "Beach person", "Mountains > beaches", "City explorer", "Staycations"],
}

// Icon mapping for each category
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Art: Palette,
  Food: UtensilsCrossed,
  Entertainment: Film,
  Lifestyle: Sparkles,
  "Weekend mood": Calendar,
  "Dating vibes": Heart,
  "Dating energy": Zap,
  "Travel style": MapPin,
}

const prompts = [
  "My ideal first date is...",
  "I'm looking for someone who...",
  "My love language is...",
  "My most controversial opinion is...",
  "I'm currently obsessed with...",
  "My biggest green flag is...",
]

const thisOrThatPairs = [
  ["Stay in on a Friday night", "Go out and see where the night takes you"],
  ["Long conversations", "Quick wit and banter"],
  ["Ambitious and career-focused", "Laid-back and enjoy the journey"],
  ["Big celebrations", "Small, intimate moments"],
]

const intentions = [
  "Serious relationship leading to marriage",
  "Long-term relationship",
  "Dating to see where it goes",
  "New friends and connections",
]

export function InterestQuestionnaire({ onComplete }: InterestQuestionnaireProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 5
  
  // Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  // Prompts answers
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // This or That
  const [choices, setChoices] = useState<Record<number, 0 | 1 | null>>({ 0: null, 1: null, 2: null, 3: null })

  // Intentions
  const [goal, setGoal] = useState<string>("")

  // Preferences sliders
  const [ageRange, setAgeRange] = useState<[number, number]>([21, 35])
  const [distance, setDistance] = useState([25])

  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const selectedCount = selectedInterests.length
  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers])

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(label)) {
        return prev.filter((i) => i !== label)
      } else {
        // Enforce max limit of 10
        if (prev.length >= 10) {
          return prev
        }
        return [...prev, label]
      }
    })
  }

  const canProceedStep1 = selectedCount >= 5
  const canProceedStep2 = answeredCount >= 3
  const canProceedStep3 = Object.values(choices).filter(c => c !== null).length >= 2
  const canProceedStep4 = !!goal

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to continue",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Prepare interests data with categories
      const interestsData = selectedInterests.map(interestName => {
        // Find the category for this interest
        let category = ''
        for (const [cat, items] of Object.entries(interestCategories)) {
          if (items.includes(interestName)) {
            category = cat
            break
          }
        }
        return {
          category,
          name: interestName
        }
      })

      // Prepare prompts data (only answered ones)
      const promptsData = Object.entries(answers)
        .filter(([_, answer]) => answer.trim())
        .map(([question, answer]) => ({
          question,
          answer
        }))

      // Prepare this or that choices
      const choicesData = Object.entries(choices)
        .filter(([_, selected]) => selected !== null)
        .map(([indexStr, selected]) => {
          const index = parseInt(indexStr)
          const [optionA, optionB] = thisOrThatPairs[index]
          return {
            optionA,
            optionB,
            selected: selected as 0 | 1,
            index
          }
        })

      // Save all questionnaire data
      const result = await completeQuestionnaire(user.id, {
        interests: interestsData,
        prompts: promptsData,
        choices: choicesData,
        goal,
        minAge: ageRange[0],
        maxAge: ageRange[1],
        maxDistance: distance[0]
      })

      if (result.success) {
        toast({
          title: "Profile Complete!",
          description: "Your dating profile is now complete.",
        })
        onComplete?.()
      } else {
        throw new Error(result.error || "Failed to complete questionnaire")
      }
    } catch (error: any) {
      console.error("Error completing questionnaire:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save your responses. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Progress dots renderer
  const renderProgressDots = () => {
    return (
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
          <div
            key={stepNum}
            className={`h-2 rounded-full transition-all duration-300 ${
              stepNum === currentStep
                ? "w-8 bg-[#97011A]"
                : stepNum < currentStep
                ? "w-2 bg-[#97011A]"
                : "w-2 bg-black/20"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with back button and progress */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-black/10">
        <button
          onClick={handleBack}
          disabled={isLoading}
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        {renderProgressDots()}
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
        <div className="flex-1 max-w-2xl w-full mx-auto">
          {/* Step 1: Interests */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#111]">What are you into?</h1>
                <p className="text-base text-black/60">Pick at least 5 interests to help us find your perfect match.</p>
              </div>

              <div className="space-y-4">
                {Object.entries(interestCategories).map(([category, items]) => {
                  const IconComponent = categoryIcons[category]
                  return (
                    <div key={category} className="space-y-3">
                      <h3 className="text-sm font-semibold text-[#111] uppercase tracking-wide flex items-center gap-2">
                        {IconComponent && <IconComponent className="w-4 h-4 text-black" />}
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                      {items.map((label) => {
                        const active = selectedInterests.includes(label)
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleInterest(label)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              active
                                ? "bg-[#97011A] text-white"
                                : "bg-white text-[#111] border-2 border-black/20 hover:border-[#97011A]"
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  )
                })}
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-black/60">Selected: {selectedCount}/10</p>
                {selectedCount < 5 && (
                  <p className="text-sm text-[#97011A] mt-1">Select at least 5 interests</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Prompts */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#111]">Answer a few prompts</h1>
                <p className="text-base text-black/60">Answer at least 3 to show your personality</p>
              </div>

              <div className="space-y-4">
                {prompts.map((p) => (
                  <div key={p} className="space-y-2 p-4 bg-black/5 rounded-xl">
                    <Label className="text-sm font-semibold text-[#111]">{p}</Label>
                    <Textarea
                      placeholder="Type your answer..."
                      value={answers[p] || ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [p]: e.target.value }))}
                      className="min-h-24 resize-none text-base text-[#111] placeholder:text-black/40 bg-white border-black/20 focus:border-[#97011A] rounded-lg"
                      maxLength={140}
                    />
                    <div className="text-xs text-black/60 text-right">{(answers[p] || "").length}/140</div>
                  </div>
                ))}
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-black/60">Answered: {answeredCount}/6</p>
                {answeredCount < 3 && (
                  <p className="text-sm text-[#97011A] mt-1">Answer at least 3 prompts</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: This or That */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#111]">This or that?</h1>
                <p className="text-base text-black/60">Which one speaks to you more?</p>
              </div>

              <div className="space-y-4">
                {thisOrThatPairs.map(([a, b], idx) => {
                  const pick = choices[idx]
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        {[a, b].map((label, i) => {
                          const active = pick === i
                          return (
                            <button
                              key={label}
                              className={`p-4 text-left rounded-xl border-2 min-h-20 flex items-center gap-2 transition-all ${
                                active
                                  ? "border-[#97011A] bg-[#97011A]/5"
                                  : "border-black/20 hover:border-black/40"
                              }`}
                              onClick={() =>
                                setChoices((prev) => ({
                                  ...prev,
                                  [idx]: prev[idx] === (i as 0 | 1) ? null : (i as 0 | 1),
                                }))
                              }
                            >
                              <Heart className={`w-5 h-5 shrink-0 ${active ? "fill-[#97011A] text-[#97011A]" : "text-black/40"}`} />
                              <span className="text-sm font-medium text-[#111]">{label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 4: Intentions */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#111]">What are you looking for?</h1>
                <p className="text-base text-black/60">Be honest about your relationship intentions</p>
              </div>

              <div className="space-y-3">
                {intentions.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-full p-5 text-left rounded-xl border-2 transition-all ${
                      goal === g
                        ? "border-[#97011A] bg-[#97011A]/5"
                        : "border-black/20 hover:border-black/40"
                    }`}
                  >
                    <span className="text-base font-medium text-[#111]">{g}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Preferences */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#111]">Your preferences</h1>
                <p className="text-base text-black/60">Help us show you the most relevant matches</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3 p-4 bg-black/5 rounded-xl">
                  <Label className="text-sm font-semibold text-[#111]">
                    Age range: {ageRange[0]} - {ageRange[1]} years
                  </Label>
                  <Slider
                    value={ageRange as any}
                    onValueChange={(val: number[]) => {
                      const [min, max] = val as [number, number]
                      const clampedMin = Math.max(18, Math.min(min, 60))
                      const clampedMax = Math.max(18, Math.min(max, 60))
                      if (clampedMin > clampedMax) return
                      setAgeRange([clampedMin, clampedMax])
                    }}
                    min={18}
                    max={60}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3 p-4 bg-black/5 rounded-xl">
                  <Label className="text-sm font-semibold text-[#111]">
                    Maximum distance: {distance[0]} km
                  </Label>
                  <Slider 
                    value={distance} 
                    onValueChange={setDistance} 
                    max={100} 
                    min={5} 
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-6 pb-8 border-t border-black/10">
        <div className="pt-4 max-w-2xl w-full mx-auto">
          {currentStep === 1 && (
            <Button 
              onClick={handleNext}
              disabled={!canProceedStep1}
              className="w-full h-14 text-base font-semibold bg-[#97011A] hover:bg-[#7A010E] text-white rounded-full shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button 
              onClick={handleNext}
              disabled={!canProceedStep2}
              className="w-full h-14 text-base font-semibold bg-[#97011A] hover:bg-[#7A010E] text-white rounded-full shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          )}
          {currentStep === 3 && (
            <Button 
              onClick={handleNext}
              disabled={!canProceedStep3}
              className="w-full h-14 text-base font-semibold bg-[#97011A] hover:bg-[#7A010E] text-white rounded-full shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          )}
          {currentStep === 4 && (
            <Button 
              onClick={handleNext}
              disabled={!canProceedStep4}
              className="w-full h-14 text-base font-semibold bg-[#97011A] hover:bg-[#7A010E] text-white rounded-full shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          )}
          {currentStep === 5 && (
            <Button 
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full h-14 text-base font-semibold bg-[#97011A] hover:bg-[#7A010E] text-white rounded-full shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Complete"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
