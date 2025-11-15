"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Zap, Heart } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { completeQuestionnaire } from "@/lib/datingProfileService"
import { useToast } from "@/hooks/use-toast"
import { StaticBackground } from "@/components/discovery/static-background"

interface InterestQuestionnaireProps {
  onComplete?: () => void
}

// Data sets
const interestCategories = {
  Art: ["Painting", "Photography", "Digital Art"],
  Food: ["Foodie", "Cooking", "Trying new restaurants"],
  Entertainment: ["Binge-watching", "Podcasts", "Stand-up comedy", "Live music"],
  Lifestyle: ["Thrifting", "DIY Projects", "Volunteering", "Wellness", "Homebody"],
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

  const canProceed = selectedCount >= 5 && answeredCount >= 3 && !!goal

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) => (prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]))
  }

  const handleComplete = async () => {
    if (!canProceed) return
    
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 [&_::selection]:bg-[#4A0E0E] [&_::selection]:text-white relative">
      <StaticBackground />
      <Card className="w-full max-w-4xl bg-white/10 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl rounded-[32px]">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-3xl font-bold text-white drop-shadow">What's your vibe?</CardTitle>
          <p className="text-sm text-white/70">Pick interests, prompts, and preferences so we can curate better matches.</p>
          <div className="mt-1">
            <Progress value={(canProceed ? 100 : Math.min(100, (selectedCount/5)*40 + (answeredCount/3)*40 + (goal ? 20 : 0)))} />
          </div>
        </CardHeader>
        <CardContent className="space-y-10">
          {/* Interests */}
          <section className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-primary">Pick at least 5 interests to help us find your perfect match.</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {Object.entries(interestCategories).map(([category, items]) => (
                <div key={category} className="p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                  <div className="mb-3 flex items-center gap-2 text-white font-medium">
                    <Sparkles className="w-4 h-4 text-white/80" /> {category}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((label) => {
                      const active = selectedInterests.includes(label)
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleInterest(label)}
                          className={`px-3 py-1.5 rounded-full text-sm transition transform active:scale-95 border shadow-inner ${
                            active
                              ? "bg-white text-black border-black shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                              : "bg-white/10 text-white border-white/20 hover:!bg-white hover:!text-black hover:!border-black"
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-white/70 tracking-wide">Selected: {selectedCount}/10</div>
          </section>

          {/* Prompts */}
          <section className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-primary">Answer a few fun prompts to show your vibe.</h3>
              <p className="text-sm text-primary">Answer at least 3</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {prompts.map((p) => (
                <div key={p} className="p-4 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                  <Label className="text-white text-sm mb-2 block">{p}</Label>
                  <Textarea
                    placeholder="Type a short answer..."
                    value={answers[p] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [p]: e.target.value }))}
                    className="min-h-20 resize-none text-white placeholder:text-white/40 bg-white/5 border-white/20"
                    maxLength={140}
                  />
                  <div className="mt-1 text-xs text-white/60 text-right">{(answers[p] || "").length}/140</div>
                </div>
              ))}
            </div>
          </section>

          {/* This or That */}
          <section className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-primary">Which one speaks to you more?</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {thisOrThatPairs.map(([a, b], idx) => {
                const pick = choices[idx]
                return (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                    {[a, b].map((label, i) => {
                      const active = pick === i
                      return (
                        <Button
                          key={label}
                          variant="outline"
                          className={`group h-auto p-4 text-left border whitespace-normal break-words leading-relaxed min-h-12 transition-all ${
                            active
                              ? "!bg-white !text-black !border-black shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                              : "bg-white/10 text-white border-white/20 hover:!bg-white hover:!text-black hover:!border-black"
                          }`}
                          onClick={() =>
                            setChoices((prev) => ({
                              ...prev,
                              [idx]: prev[idx] === (i as 0 | 1) ? null : (i as 0 | 1),
                            }))
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Heart className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-black" : "text-white group-hover:text-black"}`} />
                            <span>{label}</span>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Intentions */}
          <section className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-primary">Be honest about your relationship intentions.</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {intentions.map((g) => (
                <Button
                  key={g}
                  variant="outline"
                  onClick={() => setGoal(g)}
                  className={`h-auto p-4 text-left border transition-all ${
                    goal === g
                      ? "!bg-white !text-black !border-black shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                      : "bg-white/10 text-white border-white/20 hover:!bg-white hover:!text-black hover:!border-black"
                  }`}
                >
                  {g}
                </Button>
              ))}
            </div>
          </section>

          {/* Preferences */}
          <section className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-primary">Help us show you the most relevant matches.</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-primary">Age range: {ageRange[0]} - {ageRange[1]} years</Label>
                <Slider
                  value={ageRange as any}
                  onValueChange={(val: number[]) => {
                    const [min, max] = val as [number, number]
                    // Enforce logical constraints and prevent cross-over
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
              <div className="space-y-2">
                <Label className="text-primary">Maximum distance: {distance[0]} km</Label>
                <Slider value={distance} onValueChange={setDistance} max={100} min={5} step={5} />
              </div>
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button 
              variant="outline" 
              className="bg-white/10 text-white border border-white/20 hover:!bg-white hover:!text-black hover:!border-black transition-all duration-200"
              disabled={isLoading}
            >
              Back
            </Button>
            <Button 
              disabled={!canProceed || isLoading} 
              onClick={handleComplete} 
              className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-white to-white text-black shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Complete"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
