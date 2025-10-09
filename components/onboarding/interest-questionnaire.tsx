"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Zap, Heart } from "lucide-react"

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

  const selectedCount = selectedInterests.length
  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers])

  const canProceed = selectedCount >= 5 && answeredCount >= 3 && !!goal

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) => (prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4 [&_::selection]:bg-[#4A0E0E] [&_::selection]:text-white">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">What's your vibe?</CardTitle>
          <div className="mt-3">
            <Progress value={(canProceed ? 100 : Math.min(100, (selectedCount/5)*40 + (answeredCount/3)*40 + (goal ? 20 : 0)))} />
          </div>
        </CardHeader>
        <CardContent className="space-y-10">
          {/* Interests */}
          <section className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-primary">Pick at least 5 interests to help us find your perfect match.</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(interestCategories).map(([category, items]) => (
                <div key={category} className="p-3 rounded-xl bg-white/60 border border-primary/10">
                  <div className="mb-2 flex items-center gap-2 text-primary font-medium">
                    <Sparkles className="w-4 h-4" /> {category}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((label) => {
                      const active = selectedInterests.includes(label)
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleInterest(label)}
                          className={`px-3 py-2 rounded-full text-sm transition transform active:scale-95 border ${
                            active
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
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
            <div className="text-center text-sm text-primary">Selected: {selectedCount}/10</div>
          </section>

          {/* Prompts */}
          <section className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-primary">Answer a few fun prompts to show your vibe.</h3>
              <p className="text-sm text-primary">Answer at least 3</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {prompts.map((p) => (
                <div key={p} className="p-4 rounded-xl border border-primary/10 bg-white/60">
                  <Label className="text-primary text-sm mb-2 block">{p}</Label>
                  <Textarea
                    placeholder="Type a short answer..."
                    value={answers[p] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [p]: e.target.value }))}
                    className="min-h-20 resize-none text-primary placeholder:text-primary"
                    maxLength={140}
                  />
                  <div className="mt-1 text-xs text-primary/70 text-right">{(answers[p] || "").length}/140</div>
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
                          className={`h-auto p-4 text-left border whitespace-normal break-words leading-relaxed min-h-12 ${
                            active ? "bg-primary text-white border-primary" : "bg-white text-primary border-primary"
                          }`}
                          onClick={() =>
                            setChoices((prev) => ({
                              ...prev,
                              [idx]: prev[idx] === (i as 0 | 1) ? null : (i as 0 | 1),
                            }))
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Heart className={`w-4 h-4 shrink-0 ${active ? "fill-white" : "fill-primary"}`} />
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
            <div className="grid md:grid-cols-2 gap-3">
              {intentions.map((g) => (
                <Button
                  key={g}
                  variant="outline"
                  onClick={() => setGoal(g)}
                  className={`h-auto p-4 text-left border ${goal === g ? "bg-primary text-white border-primary" : "bg-white text-primary border-primary"}`}
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
            <Button variant="outline" className="border-primary text-primary">Back</Button>
            <Button disabled={!canProceed} onClick={() => onComplete?.()} className="bg-primary text-white hover:bg-primary/90">Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
