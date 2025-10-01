"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, Video, X } from "lucide-react"

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newPhotos: Photo[] = []
      
      for (let i = 0; i < Math.min(files.length, 5 - photos.length); i++) {
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

  const handleNext = () => {
    if (name.trim() && photos.length >= 3) {
      onComplete()
    }
  }

  const isComplete = name.trim() && photos.length >= 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-black">Let's build your profile</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Name Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-black">
                Welcome{name ? `, ${name}` : ""}! Now, let's add some photos.
              </h2>
              <p className="text-sm text-black mt-2">
                Show us who you are. Add at least 3 photos to stand out.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black">What should we call you?</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-black placeholder:text-black"
              />
            </div>
          </div>

          {/* Main Profile Photo */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-muted/20 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  {photos.length > 0 ? (
                    <img 
                      src={photos[0].preview} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>

          {/* Photo Thumbnails */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black text-center">Your Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="space-y-2">
                    <div className="relative">
                      <img 
                        src={photo.preview} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder={photoPrompts[index] || "Add a caption..."}
                      value={photo.caption || ""}
                      onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                      className="text-xs text-black placeholder:text-black"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-black">Add a video (optional)</h3>
              <p className="text-sm text-black">Add a 15-second video to bring your profile to life!</p>
            </div>
            
            <div className="text-center">
              <Button
                onClick={() => videoInputRef.current?.click()}
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <Video className="w-4 h-4 mr-2" />
                {video ? "Change Video" : "Add Video"}
              </Button>
              {video && (
                <p className="text-xs text-black mt-2">{video.name}</p>
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
          <div className="flex justify-between pt-6">
            <Button variant="ghost" onClick={onBack} className="text-black">
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!isComplete}
              className="bg-black text-white hover:bg-black/90 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
