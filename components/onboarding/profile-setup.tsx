"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, Video, X } from "lucide-react"
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
          caption: ""
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
    if (name.trim() && photos.length >= 2) {
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

  const isComplete = name.trim() && photos.length >= 2

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
          <div className="h-2 w-8 rounded-full bg-[#97011A]" />
          <div className="h-2 w-2 rounded-full bg-black/20" />
          <div className="h-2 w-2 rounded-full bg-black/20" />
          <div className="h-2 w-2 rounded-full bg-black/20" />
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl w-full mx-auto">
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-[#111]">
              Welcome{name ? `, ${name}` : ""}! Now, let's add some photos.
            </h1>
            <p className="text-base text-black/60">
              Show us who you are. Add at least 2 photos to stand out.
            </p>
          </div>
          
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-[#111] uppercase tracking-wide">
              What should we call you?
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base text-[#111] border-black/20 focus:border-[#97011A] focus:ring-2 focus:ring-[#97011A]/20 rounded-xl"
            />
            {!name.trim() && (
              <p className="text-[#97011A] text-sm">Please type your name to continue</p>
            )}
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#111] mb-2">Add your photos</h3>
              <p className="text-sm text-black/60">Min 2 photos, max 6. {photos.length > 0 ? `${photos.length} added.` : 'None yet.'}</p>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= 6}
                className="px-6 py-3 bg-[#97011A] text-white rounded-full font-semibold hover:bg-[#7A010E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {photos.length >= 6 ? "Max reached" : "Upload Photo"}
              </button>
              {photos.length < 2 && (
                <p className="text-[#97011A] text-sm mt-2">
                  {photos.length === 0 ? 'Add at least 2 photos to continue' : 'Add 1 more photo to continue'}
                </p>
              )}
            </div>
          </div>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="space-y-2">
                    <div className="relative aspect-square">
                      <img 
                        src={photo.preview} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#97011A] text-white flex items-center justify-center hover:bg-[#7A010E] transition-colors shadow-md"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Input
                      placeholder={photoPrompts[index] || "Caption..."}
                      value={photo.caption || ""}
                      onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                      className="text-xs text-[#111] placeholder:text-black/40 h-8 border-black/20 focus:border-[#97011A] rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-[#111]">Add a video (optional)</h3>
              <p className="text-sm text-black/60">15-second video to bring your profile to life!</p>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => videoInputRef.current?.click()}
                className="px-6 py-3 bg-white text-[#111] border-2 border-black/20 rounded-full font-semibold hover:border-[#97011A] transition-colors inline-flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                {video ? "Change Video" : "Add Video"}
              </button>
              {video && (
                <p className="text-sm text-black/60 mt-2">{video.name}</p>
              )}
            </div>
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
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-6 pb-8">
        <Button 
          onClick={handleNext}
          disabled={!isComplete || isLoading}
          className="w-full h-14 text-base font-semibold bg-[#97011A] hover:bg-[#7A010E] text-white rounded-full shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  )
}
