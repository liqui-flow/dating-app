"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { saveDatingBio } from "@/lib/datingProfileService"
import { useToast } from "@/hooks/use-toast"

interface AboutMyselfProps {
  onComplete: () => void
  onBack: () => void
}

const MIN_CHARACTERS = 20
const MAX_CHARACTERS = 300

export function AboutMyself({ onComplete, onBack }: AboutMyselfProps) {
  const [bio, setBio] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Load existing bio if available
  useEffect(() => {
    const loadExistingBio = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('dating_profile_full')
            .select('bio')
            .eq('user_id', user.id)
            .maybeSingle()
          
          if (profile?.bio) {
            setBio(profile.bio)
          }
        }
      } catch (error) {
        console.error("Error loading existing bio:", error)
      }
    }
    loadExistingBio()
  }, [])

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_CHARACTERS) {
      setBio(value)
    }
  }

  const handleNext = async () => {
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

      // Validate minimum length
      const trimmedBio = bio.trim()
      if (trimmedBio.length < MIN_CHARACTERS) {
        toast({
          title: "Bio too short",
          description: `Please write at least ${MIN_CHARACTERS} characters about yourself.`,
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Save bio to database
      const result = await saveDatingBio(user.id, trimmedBio)

      if (result.success) {
        toast({
          title: "Bio Saved!",
          description: "Your about me has been saved successfully.",
        })
        onComplete()
      } else {
        throw new Error(result.error || "Failed to save bio")
      }
    } catch (error: any) {
      console.error("Error saving bio:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save your bio. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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
          <div className="h-2 w-8 rounded-full bg-[#97011A]" />
          <div className="h-2 w-2 rounded-full bg-black/20" />
          <div className="h-2 w-2 rounded-full bg-black/20" />
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl w-full mx-auto">
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#111]">Tell us about yourself</h1>
            <p className="text-base text-black/60">
              Share a brief introduction about yourself, your interests, and what makes you unique.
            </p>
          </div>

          {/* Bio Input */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold text-[#111] uppercase tracking-wide">
              About Myself
            </Label>
            <Textarea
              id="bio"
              placeholder="I love hiking on weekends, trying new cuisines, and..."
              value={bio}
              onChange={handleBioChange}
              rows={12}
              maxLength={MAX_CHARACTERS}
              className="text-base text-[#111] placeholder:text-black/40 resize-none min-h-[250px] border-black/20 focus:border-[#97011A] focus:ring-2 focus:ring-[#97011A]/20 rounded-xl"
            />
            <div className="flex justify-between items-center">
              <p className={`text-sm ${
                bio.length > 0 && bio.length < MIN_CHARACTERS
                  ? "text-[#97011A]"
                  : "text-black/60"
              }`}>
                {bio.length > 0 && bio.length < MIN_CHARACTERS
                  ? `At least ${MIN_CHARACTERS} characters required`
                  : "Tell us about yourself"}
              </p>
              <p className={`text-sm ${
                bio.length === MAX_CHARACTERS 
                  ? "text-[#97011A]"
                  : bio.length < MIN_CHARACTERS && bio.length > 0
                  ? "text-[#97011A]"
                  : "text-black/60"
              }`}>
                {bio.length}/{MAX_CHARACTERS}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-6 pb-8">
        <Button 
          onClick={handleNext}
          disabled={isLoading || bio.trim().length < MIN_CHARACTERS || bio.trim().length > MAX_CHARACTERS}
          className="w-full h-14 text-base font-semibold bg-[#97011A] hover:bg-[#7A010E] text-white rounded-full shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  )
}

