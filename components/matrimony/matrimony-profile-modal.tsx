"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { X, MapPin, Briefcase, GraduationCap, Users, Share, Flag, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MatrimonyProfile } from "@/lib/mockMatrimonyProfiles"

interface MatrimonyProfileModalProps {
  profile: MatrimonyProfile
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: () => void
  onNotNow: () => void
}

export function MatrimonyProfileModal({ profile, open, onOpenChange, onConnect, onNotNow }: MatrimonyProfileModalProps) {
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
      <DialogContent className="max-w-sm sm:max-w-md p-0 gap-0 max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-white/10 backdrop-blur-md border-white/20 mx-2 sm:mx-0">
        <div className="flex flex-col h-full">
          {/* Photo Section */}
          <div className="relative h-80 sm:h-96 flex-shrink-0" onClick={handlePhotoClick}>
            <img
              src={profile.photos[currentPhotoIndex] || "/placeholder.svg"}
              alt={`${profile.name} photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Photo indicators */}
            {profile.photos.length > 1 && (
              <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex space-x-1">
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
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex space-x-1 sm:space-x-2">
              <Button variant="secondary" size="sm" className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0">
                <Share className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="secondary" size="sm" className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0">
                <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex space-x-2">
              {profile.verified && <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1">Verified</Badge>}
              {profile.premium && <Badge className="bg-[#4A0E0E] text-white text-xs px-2 py-1">Premium</Badge>}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold">
                  {profile.name}, {profile.age}
                </h1>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{profile.location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm">{profile.profession}</span>
                </div>
                {profile.education && (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm">{profile.education}</span>
                  </div>
                )}
                {profile.religion && (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm">{profile.religion}</span>
                  </div>
                )}
                {profile.community && (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm">{profile.community}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Bio */}
            {profile.bio && (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base">About</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm sm:text-base">Interests</h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs px-2 py-1">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 p-4 sm:p-6 border-t border-border">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              <Button
                variant="outline"
                size="lg"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                onClick={onNotNow}
              >
                <X className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>

              <Button size="lg" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0" onClick={onConnect}>
                <Heart className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
