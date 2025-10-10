"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Briefcase, GraduationCap, Users, Edit, Share, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileViewProps {
  isOwnProfile?: boolean
  onEdit?: () => void
}

// Mock profile data
const mockProfile = {
  name: "Sarah Johnson",
  age: 28,
  location: "San Francisco, CA",
  occupation: "Software Engineer",
  education: "Master's in Computer Science",
  bio: "I love exploring new places, trying different cuisines, and spending quality time with family. Looking for someone who shares similar values and is ready for a meaningful relationship that leads to marriage.",
  photos: [
    "/professional-woman-smiling.png",
    "/woman-hiking.png",
    "/woman-at-coffee-shop.png",
    "/woman-with-family.jpg",
  ],
  interests: ["Travel", "Cooking", "Hiking", "Photography", "Reading"],
  lifestyle: {
    smoking: "Never",
    drinking: "Socially",
    diet: "Vegetarian",
    exercise: "Few times a week",
  },
  matrimony: {
    religion: "Hindu",
    motherTongue: "Hindi",
    familyType: "Nuclear Family",
    familyValues: "Traditional",
  },
  verified: true,
  premium: true,
}

export function ProfileView({ isOwnProfile = false, onEdit }: ProfileViewProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">{isOwnProfile ? "My Profile" : mockProfile.name}</h1>
          <div className="flex items-center space-x-2">
            {isOwnProfile ? (
              <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pb-20 space-y-6">
        {/* Photo Section */}
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={mockProfile.photos[currentPhotoIndex] || "/placeholder.svg"}
              alt={`${mockProfile.name} photo ${currentPhotoIndex + 1}`}
              className="w-full h-96 object-cover"
            />

            {/* Photo navigation dots */}
            {mockProfile.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {mockProfile.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentPhotoIndex ? "bg-white" : "bg-white/50",
                    )}
                  />
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              {mockProfile.verified && <Badge className="bg-primary text-primary-foreground">Verified</Badge>}
              {mockProfile.premium && <Badge className="bg-[#4A0E0E] text-white">Premium</Badge>}
            </div>
          </div>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {mockProfile.name}, {mockProfile.age}
                </h2>
                {!isOwnProfile && (
                  <Button size="sm" className="rounded-full">Like</Button>
                )}
              </div>

              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{mockProfile.location}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{mockProfile.occupation}</span>
              </div>
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{mockProfile.education}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">About Me</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{mockProfile.bio}</p>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {mockProfile.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Lifestyle</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Smoking</p>
                <p className="text-sm text-muted-foreground">{mockProfile.lifestyle.smoking}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Drinking</p>
                <p className="text-sm text-muted-foreground">{mockProfile.lifestyle.drinking}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Diet</p>
                <p className="text-sm text-muted-foreground">{mockProfile.lifestyle.diet}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Exercise</p>
                <p className="text-sm text-muted-foreground">{mockProfile.lifestyle.exercise}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matrimony Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Cultural Background</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Religion</p>
                <p className="text-sm text-muted-foreground">{mockProfile.matrimony.religion}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Mother Tongue</p>
                <p className="text-sm text-muted-foreground">{mockProfile.matrimony.motherTongue}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Family Type</p>
                <p className="text-sm text-muted-foreground">{mockProfile.matrimony.familyType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Family Values</p>
                <p className="text-sm text-muted-foreground">{mockProfile.matrimony.familyValues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
