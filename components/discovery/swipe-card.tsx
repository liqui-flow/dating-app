"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, GraduationCap, Info } from "lucide-react"
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

interface SwipeCardProps {
  profile: Profile
  onLike: () => void
  onPass: () => void
  onProfileClick: () => void
}

export function SwipeCard({ profile, onLike, onPass, onProfileClick }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handlePhotoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
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
    <Card
      className={cn(
        "w-full max-w-sm h-[600px] overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]",
        isDragging && "transition-none",
      )}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
      }}
    >
      {/* Photo Section */}
      <div className="relative h-2/3" onClick={handlePhotoClick}>
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

        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {profile.verified && <Badge className="bg-primary text-primary-foreground">Verified</Badge>}
          {profile.premium && <Badge className="bg-secondary text-secondary-foreground">Premium</Badge>}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Info Section */}
      <CardContent className="p-4 space-y-3 h-1/3 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {profile.name}, {profile.age}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onProfileClick()
                }}
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{profile.distance}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs">{profile.occupation}</span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs">{profile.education}</span>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="flex flex-wrap gap-1">
          {profile.interests.slice(0, 3).map((interest) => (
            <Badge key={interest} variant="outline" className="text-xs">
              {interest}
            </Badge>
          ))}
          {profile.interests.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{profile.interests.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
