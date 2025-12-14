"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UserCircle, Users, HeartHandshake, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { saveDatingPreferences } from "@/lib/datingProfileService"
import { useToast } from "@/hooks/use-toast"

interface DatingPreferencesProps {
  onComplete: () => void
  onBack: () => void
}

type DatingPreference = "men" | "women" | "everyone"

const preferenceOptions = [
  {
    id: "men" as DatingPreference,
    label: "Men",
    icon: UserCircle,
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
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePreferenceSelect = (preference: DatingPreference) => {
    setSelectedPreference(preference)
  }

  const handleNext = async () => {
    if (selectedPreference) {
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

        // Save dating preferences to database
        const result = await saveDatingPreferences(
          user.id,
          selectedPreference,
          showOnProfile
        )

        if (result.success) {
          toast({
            title: "Preferences Saved!",
            description: "Your dating preferences have been saved.",
          })
          onComplete()
        } else {
          throw new Error(result.error || "Failed to save preferences")
        }
      } catch (error: any) {
        console.error("Error saving preferences:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to save your preferences. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with back button and progress */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-black/10">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#97011A]" />
          <div className="h-2 w-2 rounded-full bg-[#97011A]" />
          <div className="h-2 w-8 rounded-full bg-[#97011A]" />
          <div className="h-2 w-2 rounded-full bg-black/20" />
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl w-full mx-auto">
        <div className="flex-1 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#111]">Who do you want to date?</h1>
            <p className="text-base text-black/60">
              Select your dating preference
            </p>
          </div>

          {/* Preference Options */}
          <div className="space-y-3">
            {preferenceOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedPreference === option.id
              
              return (
                <button
                  key={option.id}
                  onClick={() => handlePreferenceSelect(option.id)}
                  className={`w-full p-5 flex items-center gap-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-[#97011A] bg-[#97011A]/5"
                      : "border-black/20 hover:border-black/40"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isSelected ? "bg-[#97011A]" : "bg-black/10"
                  }`}>
                    <Icon
                      className={`w-6 h-6 ${
                        isSelected ? "text-white" : "text-black"
                      }`}
                    />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-lg font-semibold text-[#111]">{option.label}</div>
                    <div className="text-sm text-black/60">{option.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#97011A] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Show on Profile Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-black/5 rounded-xl">
            <Checkbox
              id="show-preference"
              checked={showOnProfile}
              onCheckedChange={(checked) => setShowOnProfile(checked as boolean)}
              className="border-black/40 data-[state=checked]:bg-[#97011A] data-[state=checked]:border-[#97011A]"
            />
            <Label htmlFor="show-preference" className="text-sm text-[#111] cursor-pointer">
              Show my preference on my profile
            </Label>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-6 pb-8">
        <Button 
          onClick={handleNext}
          disabled={!selectedPreference || isLoading}
          className="w-full h-14 text-base font-semibold bg-[#97011A] hover:bg-[#7A010E] text-white rounded-full shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  )
}
