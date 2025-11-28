"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"
import { saveDatingBio } from "@/lib/datingProfileService"
import { useToast } from "@/hooks/use-toast"
import { StaticBackground } from "@/components/discovery/static-background"

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
    <div className="min-h-screen flex items-center justify-center p-4 [&_::selection]:bg-[#4A0E0E] [&_::selection]:text-white relative">
      <StaticBackground />
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Tell us about yourself</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Main Question */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Write a short bio (20-300 characters)
            </h2>
            <p className="text-sm text-primary/70">
              Share a brief introduction about yourself
            </p>
          </div>

          {/* Bio Input */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-primary text-sm">About Myself</Label>
            <Textarea
              id="bio"
              placeholder="Share a brief introduction about yourself, your interests, and what makes you unique..."
              value={bio}
              onChange={handleBioChange}
              rows={12}
              maxLength={MAX_CHARACTERS}
              className="text-primary placeholder:text-primary/50 resize-none min-h-[200px]"
            />
            <div className="flex justify-between items-center">
              <p className={`text-xs ${
                bio.length > 0 && bio.length < MIN_CHARACTERS
                  ? "text-red-500"
                  : "text-primary/60"
              }`}>
                {bio.length > 0 && bio.length < MIN_CHARACTERS
                  ? `At least ${MIN_CHARACTERS} characters required`
                  : "Tell us about yourself"}
              </p>
              <p className={`text-xs ${
                bio.length === MAX_CHARACTERS 
                  ? "text-red-500"
                  : bio.length < MIN_CHARACTERS && bio.length > 0
                  ? "text-red-500"
                  : "text-primary/60"
              }`}>
                {bio.length}/{MAX_CHARACTERS}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="bg-white/10 text-white border border-white/20 hover:!bg-white hover:!text-black hover:!border-black transition-all duration-200"
              disabled={isLoading}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={isLoading || bio.trim().length < MIN_CHARACTERS || bio.trim().length > MAX_CHARACTERS}
              className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-white to-white text-black shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

