"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, HeartHandshake } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { saveUserPath, upsertUserPath } from "@/lib/pathService"
import { useToast } from "@/hooks/use-toast"
import { StaticBackground } from "@/components/discovery/static-background"

interface PathSelectProps {
  onSelect: (path: "dating" | "matrimony") => void
  onBack?: () => void
}

export function PathSelect({ onSelect, onBack }: PathSelectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePathSelect = async (path: "dating" | "matrimony") => {
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

      // Save path to database
      const result = await saveUserPath(user.id, path)
      
      if (result.success) {
        toast({
          title: "Path Selected",
          description: `You've selected the ${path} path!`,
        })
        // Call the original onSelect callback
        onSelect(path)
      } else {
        // If profile doesn't exist yet, you might want to just continue
        // and save the path later when the full profile is created
        console.log("Profile not found, continuing anyway...")
        onSelect(path)
      }
    } catch (error) {
      console.error("Error selecting path:", error)
      toast({
        title: "Error",
        description: "Failed to save your selection. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-white">
      <StaticBackground />
      <Card className="w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-black">Choose Your Path</CardTitle>
          <CardDescription className="text-base text-black/75 font-medium">Select how you want to continue after verification</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 px-6 justify-start text-left group bg-white text-black border-2 border-black/20 transition-all duration-300 hover:border-[#97011A] hover:shadow-lg hover:scale-[1.02] relative overflow-hidden"
            onClick={() => handlePathSelect("dating")}
            disabled={isLoading}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-[#97011A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center space-x-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#97011A] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <Heart className="w-7 h-7 text-white fill-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-lg font-bold text-black group-hover:text-[#97011A] transition-colors">Dating</div>
                <div className="text-sm text-black/60 font-medium mt-0.5">
                  Swipe-based discovery with fun profiles
                </div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 px-6 justify-start text-left group bg-white text-black border-2 border-black/20 transition-all duration-300 hover:border-[#97011A] hover:shadow-lg hover:scale-[1.02] relative overflow-hidden"
            onClick={() => handlePathSelect("matrimony")}
            disabled={isLoading}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-[#97011A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center space-x-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#97011A] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <HeartHandshake className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-lg font-bold text-black group-hover:text-[#97011A] transition-colors">Matrimony</div>
                <div className="text-sm text-black/60 font-medium mt-0.5">
                  Serious profiles with detailed preferences
                </div>
              </div>
            </div>
          </Button>

          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="mt-2 bg-white text-[#97011A] border-2 border-[#97011A]/20 hover:bg-[#97011A]/5 hover:border-[#97011A] transition-all duration-200 font-semibold"
            >
              Back
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
