"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { User, Users, HeartHandshake } from "lucide-react"

interface DatingPreferencesProps {
  onComplete: () => void
  onBack: () => void
}

type DatingPreference = "men" | "women" | "everyone"

const preferenceOptions = [
  {
    id: "men" as DatingPreference,
    label: "Men",
    icon: User,
    description: "I'm interested in men"
  },
  {
    id: "women" as DatingPreference,
    label: "Women", 
    icon: Users,
    description: "I'm interested in women"
  },
  {
    id: "everyone" as DatingPreference,
    label: "Everyone",
    icon: HeartHandshake,
    description: "I'm open to dating anyone"
  }
]

export function DatingPreferences({ onComplete, onBack }: DatingPreferencesProps) {
  const [selectedPreference, setSelectedPreference] = useState<DatingPreference | null>(null)
  const [showOnProfile, setShowOnProfile] = useState(true)

  const handlePreferenceSelect = (preference: DatingPreference) => {
    setSelectedPreference(preference)
  }

  const handleNext = () => {
    if (selectedPreference) {
      onComplete()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4 [&_::selection]:bg-[#4A0E0E] [&_::selection]:text-white">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Who do you prefer to date?</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Main Question */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-primary mb-8">
              I'd like to date...
            </h2>
          </div>

          {/* Preference Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {preferenceOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedPreference === option.id
              
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className={`h-auto p-6 flex flex-col items-center space-y-3 transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-white border-primary hover:bg-primary"
                      : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
                  }`}
                  onClick={() => handlePreferenceSelect(option.id)}
                >
                  <div className="w-12 h-12 rounded-full bg-current/10 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${
                      isSelected ? "text-white" : "text-primary group-hover:text-white"
                    }`} />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-medium">{option.label}</div>
                    <div className="text-sm opacity-80">{option.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Show on Profile Toggle */}
          <div className="flex items-center space-x-3 justify-center">
            <Checkbox
              id="show-preference"
              checked={showOnProfile}
              onCheckedChange={(checked) => setShowOnProfile(checked as boolean)}
              className="border-primary"
            />
            <Label htmlFor="show-preference" className="text-primary text-sm">
              Show my preference on my profile
            </Label>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button variant="ghost" onClick={onBack} className="text-primary">
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!selectedPreference}
              className="bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
