"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Heart } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { saveUserPath, upsertUserPath } from "@/lib/pathService"
import { useToast } from "@/hooks/use-toast"

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your Path</CardTitle>
          <CardDescription>Select how you want to continue after verification</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
        <Button
  variant="outline"
  className="h-auto py-6 justify-start text-left group"
  onClick={() => handlePathSelect("dating")}
  disabled={isLoading}
>
  <div className="flex items-center space-x-4">
    <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
      <Heart className="w-5 h-5" />
    </div>
    <div>
      <div className="text-base font-medium">Dating</div>
      <div className="text-xs text-muted-foreground">
        Swipe-based discovery with fun profiles
      </div>
    </div>
  </div>
</Button>



          <Button
            variant="outline"
            className="h-auto py-6 justify-start text-left"
            onClick={() => handlePathSelect("matrimony")}
            disabled={isLoading}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-medium">Matrimony</div>
                <div className="text-xs text-muted-foreground">Serious profiles with detailed preferences</div>
              </div>
            </div>
          </Button>

          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
