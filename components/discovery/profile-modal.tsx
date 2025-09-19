"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Heart, X, MapPin, Briefcase, GraduationCap, Users, Share, Flag } from "lucide-react"
import { cn } from "@/lib/utils"

interface Profile {
  id: string
  name: string
  age: number
  location: string
  occupation: string
  education: string
  photos: string[]
  bio: string
  interests: string[]
  religion: string
  verified: boolean
  premium: boolean
  distance: string
}

interface ProfileModalProps {
  profile: Profile
  open: boolean
  onOpenChange: (open: boolean) => void
  onLike: () => void
  onPass: () => void
}

export function ProfileModal({ profile, open, onOpenChange, onLike, onPass }: ProfileModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const handlePhotoClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const cardWidth = rect.width

    if (clickX > cardWidth / 2) {
      // Right side - next photo
      if (currentPhotoIndex < profile.photos.length - 1) {
        setCurrentPhotoIndex((prev) => prev + 1)
      }
    } else {
      // Left side - previous photo
      if (currentPhotoIndex > 0) {
        setCurrentPhotoIndex((prev) => prev - 1)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Photo Section */}
          <div className="relative h-96 flex-shrink-0" onClick={handlePhotoClick}>
            <img
              src={profile.photos[currentPhotoIndex] || "/placeholder.svg"}
              alt={`${profile.name} photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Photo indicators */}
            {profile.photos.length > 1 && (
              <div className="absolute top-4 left-4 right-4 flex space-x-1">
                {profile.photos.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-1 h-1 rounded-full transition-colors",
                      index === currentPhotoIndex ? "bg-white" : "bg-white/30",
                    )}
                  />
                ))}
              </div>
            )}

            {/* Header Actions */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button variant="secondary" size="sm" className="rounded-full w-8 h-8 p-0">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" className="rounded-full w-8 h-8 p-0">
                <Flag className="w-4 h-4" />
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute bottom-4 left-4 flex space-x-2">
              {profile.verified && <Badge className="bg-primary text-primary-foreground">Verified</Badge>}
              {profile.premium && <Badge className="bg-secondary text-secondary-foreground">Premium</Badge>}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  {profile.name}, {profile.age}
                </h1>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.distance}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profile.occupation}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profile.education}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profile.religion}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Bio */}
            <div className="space-y-2">
              <h3 className="font-semibold">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            </div>

            <Separator />

            {/* Interests */}
            <div className="space-y-3">
              <h3 className="font-semibold">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 p-6 border-t border-border">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                className="w-16 h-16 rounded-full p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                onClick={onPass}
              >
                <X className="w-8 h-8" />
              </Button>

              <Button size="lg" className="w-16 h-16 rounded-full p-0" onClick={onLike}>
                <Heart className="w-8 h-8 fill-current" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
