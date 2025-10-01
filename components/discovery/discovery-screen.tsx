"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SwipeCard } from "@/components/discovery/swipe-card"
import { FilterSheet } from "@/components/discovery/filter-sheet"
import { ProfileModal } from "@/components/discovery/profile-modal"
import { Heart, Filter } from "lucide-react"

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
  {
    id: "4",
    name: "Neha Verma",
    age: 27,
    location: "Pune, India",
    occupation: "UX Designer",
    education: "B.Des",
    photos: ["/professional-woman-smiling.png", "/woman-at-coffee-shop.png"],
    bio: "Design lover, foodie, and a weekend traveler. Looking for a thoughtful partner.",
    interests: ["Design", "Food", "Travel", "Art"],
    religion: "Hindu",
    verified: true,
    premium: false,
    distance: "3 km away",
  },
  {
    id: "5",
    name: "Rahul Mehta",
    age: 30,
    location: "Ahmedabad, India",
    occupation: "Product Manager",
    education: "MBA",
    photos: ["/casual-outdoor-photo.jpg", "/professional-headshot.png"],
    bio: "Ambitious and grounded. Love building products and long walks.",
    interests: ["Startups", "Cricket", "Walking", "Podcasts"],
    religion: "Hindu",
    verified: true,
    premium: true,
    distance: "10 km away",
  },
  {
    id: "6",
    name: "Aisha Khan",
    age: 25,
    location: "Hyderabad, India",
    occupation: "Teacher",
    education: "M.A.",
    photos: ["/woman-with-family.jpg", "/professional-woman-smiling.png"],
    bio: "Family values and kindness first. I enjoy cooking and reading classics.",
    interests: ["Cooking", "Reading", "Family", "Movies"],
    religion: "Muslim",
    verified: true,
    premium: false,
    distance: "6 km away",
  },
  {
    id: "7",
    name: "Vikram Singh",
    age: 31,
    location: "Jaipur, India",
    occupation: "Entrepreneur",
    education: "B.Com",
    photos: ["/new-profile-photo.jpg", "/casual-outdoor-photo.jpg"],
    bio: "Building my dream and looking for a partner to share it with.",
    interests: ["Business", "Fitness", "Travel", "Music"],
    religion: "Sikh",
    verified: false,
    premium: true,
    distance: "14 km away",
  },
  {
    id: "8",
    name: "Anjali Nair",
    age: 26,
    location: "Kochi, India",
    occupation: "Data Analyst",
    education: "B.Sc",
    photos: ["/professional-headshot.png", "/woman-hiking.png"],
    bio: "Numbers by day, nature lover by weekend. Seeking a balanced partner.",
    interests: ["Analytics", "Hiking", "Cooking", "Poetry"],
    religion: "Hindu",
    verified: true,
    premium: false,
    distance: "4 km away",
  },
  {
    id: "9",
    name: "Rohit Gupta",
    age: 28,
    location: "Chandigarh, India",
    occupation: "Civil Engineer",
    education: "B.E.",
    photos: ["/placeholder-user.jpg", "/casual-outdoor-photo.jpg"],
    bio: "Simple, honest and family-oriented. I like road trips and home-cooked food.",
    interests: ["Road Trips", "Food", "Music", "Movies"],
    religion: "Hindu",
    verified: false,
    premium: false,
    distance: "11 km away",
  },
  {
    id: "10",
    name: "Meera Iyer",
    age: 29,
    location: "Chennai, India",
    occupation: "Research Scientist",
    education: "Ph.D",
    photos: ["/woman-at-coffee-shop.png", "/professional-woman-smiling.png"],
    bio: "Curious mind, kind heart. Interested in science, music, and culture.",
    interests: ["Science", "Classical Music", "Reading", "Travel"],
    religion: "Hindu",
    verified: true,
    premium: true,
    distance: "7 km away",
  },
  {
    id: "11",
    name: "Farhan Ali",
    age: 27,
    location: "Lucknow, India",
    occupation: "Photographer",
    education: "B.A.",
    photos: ["/casual-outdoor-photo.jpg", "/placeholder-user.jpg"],
    bio: "Capturing moments. Looking for someone to share new ones with.",
    interests: ["Photography", "Travel", "Coffee", "Art"],
    religion: "Muslim",
    verified: true,
    premium: false,
    distance: "9 km away",
  },
  {
    id: "12",
    name: "Riya Das",
    age: 24,
    location: "Kolkata, India",
    occupation: "Content Writer",
    education: "B.A.",
    photos: ["/professional-woman-smiling.png", "/woman-with-family.jpg"],
    bio: "Words, books, and long conversations. Seeking a warm, supportive partner.",
    interests: ["Writing", "Books", "Cafe Hopping", "Movies"],
    religion: "Hindu",
    verified: false,
    premium: false,
    distance: "2 km away",
  },
  {
    id: "13",
    name: "Kabir Malhotra",
    age: 32,
    location: "Gurgaon, India",
    occupation: "Finance Consultant",
    education: "MBA",
    photos: ["/professional-headshot.png", "/new-profile-photo.jpg"],
    bio: "Finance by weekday, foodie by weekend. Family comes first.",
    interests: ["Finance", "Food", "Fitness", "Travel"],
    religion: "Hindu",
    verified: true,
    premium: true,
    distance: "15 km away",
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
      {/* Floating header elements */}
      <div className="fixed top-3 left-4 z-40 text-xl font-semibold">Discover</div>
      <div className="fixed top-3 right-3 z-40">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full px-4 py-3 shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 pb-20 mt-10">
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

            {/* Action Buttons removed as requested */}
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