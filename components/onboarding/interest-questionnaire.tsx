"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface InterestQuestionnaireProps {
  onComplete?: () => void
}

const interests = [
  "Travel",
  "Cooking",
  "Fitness",
  "Reading",
  "Music",
  "Movies",
  "Art",
  "Sports",
  "Photography",
  "Dancing",
  "Gaming",
  "Hiking",
  "Yoga",
  "Fashion",
  "Technology",
  "Food",
]

const values = [
  "Family-oriented",
  "Career-focused",
  "Spiritual",
  "Adventurous",
  "Traditional",
  "Modern",
  "Ambitious",
  "Laid-back",
  "Social",
  "Introverted",
]

export function InterestQuestionnaire({ onComplete }: InterestQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [ageRange, setAgeRange] = useState([25, 35])
  const [distance, setDistance] = useState([50])
  const [bio, setBio] = useState("")
  const [relationshipGoal, setRelationshipGoal] = useState("")

  const totalSteps = 5
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const handleValueToggle = (value: string) => {
    setSelectedValues((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete?.()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedInterests.length >= 3
      case 1:
        return selectedValues.length >= 2
      case 2:
        return true
      case 3:
        return relationshipGoal !== ""
      case 4:
        return bio.length >= 50
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 0: Interests */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <CardTitle className="text-xl">What are you into?</CardTitle>
                <CardDescription>Select at least 3 interests to help us find your perfect match</CardDescription>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {interests.map((interest) => (
                  <Button
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInterestToggle(interest)}
                    className="justify-start"
                  >
                    {interest}
                  </Button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Selected: {selectedInterests.length}/16</p>
              </div>
            </div>
          )}

          {/* Step 1: Values */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <CardTitle className="text-xl">What matters to you?</CardTitle>
                <CardDescription>Choose values that are important in a relationship</CardDescription>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {values.map((value) => (
                  <Button
                    key={value}
                    variant={selectedValues.includes(value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleValueToggle(value)}
                    className="justify-start"
                  >
                    {value}
                  </Button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Selected: {selectedValues.length}/10</p>
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <CardTitle className="text-xl">Your preferences</CardTitle>
                <CardDescription>Help us show you the most relevant matches</CardDescription>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>
                    Age range: {ageRange[0]} - {ageRange[1]} years
                  </Label>
                  <Slider value={ageRange} onValueChange={setAgeRange} max={60} min={18} step={1} className="w-full" />
                </div>

                <div className="space-y-3">
                  <Label>Maximum distance: {distance[0]} km</Label>
                  <Slider value={distance} onValueChange={setDistance} max={100} min={5} step={5} className="w-full" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Relationship Goals */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <CardTitle className="text-xl">What are you looking for?</CardTitle>
                <CardDescription>Be honest about your relationship intentions</CardDescription>
              </div>

              <div className="space-y-3">
                {[
                  "Serious relationship leading to marriage",
                  "Long-term relationship",
                  "Dating to see where it goes",
                  "New friends and connections",
                ].map((goal) => (
                  <Button
                    key={goal}
                    variant={relationshipGoal === goal ? "default" : "outline"}
                    onClick={() => setRelationshipGoal(goal)}
                    className="w-full justify-start text-left h-auto p-4"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Bio */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <CardTitle className="text-xl">Tell us about yourself</CardTitle>
                <CardDescription>Write a brief bio to help others get to know you</CardDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Your bio</Label>
                <Textarea
                  id="bio"
                  placeholder="I love exploring new places, trying different cuisines, and spending time with family. Looking for someone who shares similar values and is ready for a meaningful relationship..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-32 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Minimum 50 characters</span>
                  <span>{bio.length}/500</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentStep === totalSteps - 1 ? "Complete" : "Next"}
              {currentStep !== totalSteps - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
