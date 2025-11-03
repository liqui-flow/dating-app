"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, Video, X } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { completeProfileSetup } from "@/lib/datingProfileService"
import { useToast } from "@/hooks/use-toast"

interface ProfileSetupProps {
  onComplete: () => void
  onBack: () => void
}

interface Photo {
  id: string
  file: File
  preview: string
  caption?: string
}

const photoPrompts = [
  "Me in my element",
  "What I look like on a Sunday morning", 
  "My favorite thing to do",
  "Candid shot (no filters!)",
  "Just being me"
]

export function ProfileSetup({ onComplete, onBack }: ProfileSetupProps) {
  const [name, setName] = useState("")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newPhotos: Photo[] = []
      const maxPhotos = 6
      const remainingSlots = maxPhotos - photos.length
      
      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const file = files[i]
        const photo: Photo = {
          id: Date.now().toString() + i,
          file,
          preview: URL.createObjectURL(file),
          caption: photoPrompts[photos.length + i] || ""
        }
        newPhotos.push(photo)
      }
      
      setPhotos(prev => [...prev, ...newPhotos])
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setVideo(file)
    }
  }

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id))
  }

  const updatePhotoCaption = (id: string, caption: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, caption } : photo
    ))
  }

  const handleNext = async () => {
    if (name.trim() && photos.length >= 3) {
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

        // Prepare photos data
        const photosData = photos.map(photo => ({
          file: photo.file,
          caption: photo.caption || ""
        }))

        // Save profile data to database
        const result = await completeProfileSetup(
          user.id,
          name.trim(),
          photosData,
          video || undefined
        )

        if (result.success) {
          toast({
            title: "Profile Saved!",
            description: "Your profile has been saved successfully.",
          })
          onComplete()
        } else {
          throw new Error(result.error || "Failed to save profile")
        }
      } catch (error: any) {
        console.error("Error saving profile:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to save your profile. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const isComplete = name.trim() && photos.length >= 3

  return (
    <div className="h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4 [&_::selection]:bg-[#4A0E0E] [&_::selection]:text-white overflow-hidden">
      <Card className="w-full max-w-2xl h-full max-h-[90vh] flex flex-col">
        <CardHeader className="text-center flex-shrink-0 pb-4">
          <CardTitle className="text-2xl font-bold text-primary">Let's build your profile</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 flex-1 overflow-y-auto">
          {/* Name Section */}
          <div className="space-y-3">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-primary">
                Welcome{name ? `, ${name}` : ""}! Now, let's add some photos.
              </h2>
              <p className="text-xs text-primary mt-1">
                Show us who you are. Add at least 3 photos to stand out.
              </p>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="name" className="text-primary text-sm">What should we call you?</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-primary placeholder:text-primary h-8"
              />
              {!name.trim() && (
                <p className="text-red-500 text-xs">Please type your name to continue</p>
              )}
            </div>
          </div>

          {/* Main Profile Photo */}
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-muted/20 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  {photos.length > 0 ? (
                    <img 
                      src={photos[0].preview} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={photos.length >= 6}
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-3 h-3 mr-1" />
                {photos.length >= 6 ? "Max reached" : "Upload Photo"}
              </Button>
              {photos.length < 3 && (
                <p className="text-red-500 text-xs mt-1">
                  Min 3 photos, max 6. {photos.length > 0 ? `${photos.length} added.` : 'None yet.'}
                </p>
              )}
              {photos.length >= 6 && (
                <p className="text-green-600 text-xs mt-1">
                  Max reached. Remove to add new ones.
                </p>
              )}
            </div>
          </div>

          {/* Photo Thumbnails */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-primary text-center">Your Photos</h3>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="space-y-1">
                    <div className="relative">
                      <img 
                        src={photo.preview} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-16 object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full p-0"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </div>
                    <Input
                      placeholder={photoPrompts[index] || "Caption..."}
                      value={photo.caption || ""}
                      onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                      className="text-xs text-primary placeholder:text-primary h-6"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Section */}
          <div className="space-y-2">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-primary">Add a video (optional)</h3>
              <p className="text-xs text-primary">15-second video to bring your profile to life!</p>
            </div>
            
            <div className="text-center">
              <Button
                onClick={() => videoInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Video className="w-3 h-3 mr-1" />
                {video ? "Change Video" : "Add Video"}
              </Button>
              {video && (
                <p className="text-xs text-primary mt-1">{video.name}</p>
              )}
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />

          {/* Navigation */}
          <div className="flex justify-between pt-4 flex-shrink-0">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-primary" 
              size="sm"
              disabled={isLoading}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!isComplete || isLoading}
              size="sm"
              className="bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
