"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SwipeCard } from "@/components/discovery/swipe-card"
import { FilterSheet } from "@/components/discovery/filter-sheet"
import { ProfileModal } from "@/components/discovery/profile-modal"
import { Heart, X, Filter, Grid, RotateCcw, Zap } from "lucide-react"

// Mock profiles data
const mockProfiles = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 26,
    location: "Mumbai, India",
    occupation: "Marketing Manager",
    education: "MBA",
    photos: ["/indian-woman-professional.png", "/woman-traditional-dress.jpg"],
    bio: "Family-oriented person who loves traveling and cooking. Looking for someone who values traditions and is ready for marriage.",
    interests: ["Travel", "Cooking", "Dancing", "Reading"],
    religion: "Hindu",
    verified: true,
    premium: false,
    distance: "5 km away",
  },
  {
    id: "2",
    name: "Arjun Patel",
    age: 29,
    location: "Delhi, India",
    occupation: "Software Engineer",
    education: "B.Tech",
    photos: ["/indian-man-professional.png", "/man-casual-outdoor.jpg"],
    bio: "Tech enthusiast who enjoys hiking and photography. Seeking a life partner who shares similar values and dreams.",
    interests: ["Technology", "Photography", "Hiking", "Music"],
    religion: "Hindu",
    verified: true,
    premium: true,
    distance: "12 km away",
  },
  {
    id: "3",
    name: "Sneha Reddy",
    age: 24,
    location: "Bangalore, India",
    occupation: "Doctor",
    education: "MBBS",
    photos: ["/woman-doctor.png", "/woman-with-friends.jpg"],
    bio: "Passionate about helping others and spending time with family. Looking for someone genuine and caring.",
    interests: ["Medicine", "Yoga", "Books", "Movies"],
    religion: "Hindu",
    verified: true,
    premium: false,
    distance: "8 km away",
  },
]

type ViewMode = "cards" | "grid"

export function DiscoveryScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<(typeof mockProfiles)[0] | null>(null)
  const [likedProfiles, setLikedProfiles] = useState<string[]>([])
  const [passedProfiles, setPassedProfiles] = useState<string[]>([])

  const currentProfile = mockProfiles[currentCardIndex]
  const hasMoreProfiles = currentCardIndex < mockProfiles.length - 1

  const handleLike = (profileId: string) => {
    setLikedProfiles((prev) => [...prev, profileId])
    if (currentCardIndex < mockProfiles.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
    }
  }

  const handlePass = (profileId: string) => {
    setPassedProfiles((prev) => [...prev, profileId])
    if (currentCardIndex < mockProfiles.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
    }
  }

  const handleRewind = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
      // Remove from liked/passed arrays
      const prevProfile = mockProfiles[currentCardIndex - 1]
      setLikedProfiles((prev) => prev.filter((id) => id !== prevProfile.id))
      setPassedProfiles((prev) => prev.filter((id) => id !== prevProfile.id))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">Discover</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "cards" ? "grid" : "cards")}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-20">
        {viewMode === "cards" ? (
          <div className="space-y-6">
            {/* Card Stack */}
            <div className="relative h-[600px] flex items-center justify-center">
              {hasMoreProfiles ? (
                <SwipeCard
                  profile={currentProfile}
                  onLike={() => handleLike(currentProfile.id)}
                  onPass={() => handlePass(currentProfile.id)}
                  onProfileClick={() => setSelectedProfile(currentProfile)}
                />
              ) : (
                <Card className="w-full max-w-sm h-96 flex items-center justify-center">
                  <CardContent className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">No more profiles</h3>
                      <p className="text-sm text-muted-foreground">
                        Check back later for new matches or adjust your filters
                      </p>
                    </div>
                    <Button onClick={() => setCurrentCardIndex(0)}>Start Over</Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Action Buttons */}
            {hasMoreProfiles && (
              <div className="flex items-center justify-center space-x-6">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-14 h-14 rounded-full p-0 bg-transparent"
                  onClick={handleRewind}
                  disabled={currentCardIndex === 0}
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-16 h-16 rounded-full p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                  onClick={() => handlePass(currentProfile.id)}
                >
                  <X className="w-8 h-8" />
                </Button>

                <Button size="lg" className="w-16 h-16 rounded-full p-0" onClick={() => handleLike(currentProfile.id)}>
                  <Heart className="w-8 h-8 fill-current" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-14 h-14 rounded-full p-0 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
                >
                  <Zap className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 gap-4">
            {mockProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedProfile(profile)}
              >
                <div className="relative">
                  <img
                    src={profile.photos[0] || "/placeholder.svg"}
                    alt={profile.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {profile.verified && <Badge className="bg-primary text-primary-foreground text-xs">✓</Badge>}
                    {profile.premium && (
                      <Badge className="bg-secondary text-secondary-foreground text-xs">Premium</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-3 space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">
                      {profile.name}, {profile.age}
                    </h3>
                    <p className="text-xs text-muted-foreground">{profile.occupation}</p>
                    <p className="text-xs text-muted-foreground">{profile.distance}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Filter Sheet */}
      <FilterSheet open={showFilters} onOpenChange={setShowFilters} />

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          open={!!selectedProfile}
          onOpenChange={() => setSelectedProfile(null)}
          onLike={() => {
            handleLike(selectedProfile.id)
            setSelectedProfile(null)
          }}
          onPass={() => {
            handlePass(selectedProfile.id)
            setSelectedProfile(null)
          }}
        />
      )}
    </div>
  )
}
