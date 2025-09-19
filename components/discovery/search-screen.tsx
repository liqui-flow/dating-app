"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, MapPin, Heart, X } from "lucide-react"
import { FilterSheet } from "./filter-sheet"

interface Profile {
  id: string
  name: string
  age: number
  location: string
  occupation: string
  photos: string[]
  interests: string[]
  verified: boolean
  premium: boolean
  distance: string
}

const mockProfiles: Profile[] = [
  {
    id: "1",
    name: "Priya",
    age: 26,
    location: "Mumbai",
    occupation: "Software Engineer",
    photos: ["/indian-woman-professional.png"],
    interests: ["Travel", "Photography", "Yoga"],
    verified: true,
    premium: false,
    distance: "2 km away",
  },
  {
    id: "2",
    name: "Ananya",
    age: 24,
    location: "Delhi",
    occupation: "Marketing Manager",
    photos: ["/professional-woman-smiling.png"],
    interests: ["Reading", "Cooking", "Dancing"],
    verified: true,
    premium: true,
    distance: "5 km away",
  },
  {
    id: "3",
    name: "Kavya",
    age: 28,
    location: "Bangalore",
    occupation: "Doctor",
    photos: ["/woman-hiking.png"],
    interests: ["Hiking", "Music", "Art"],
    verified: false,
    premium: false,
    distance: "8 km away",
  },
  {
    id: "4",
    name: "Rahul",
    age: 30,
    location: "Ahmedabad",
    occupation: "Product Manager",
    photos: ["/casual-outdoor-photo.jpg"],
    interests: ["Startups", "Cricket", "Walking"],
    verified: true,
    premium: true,
    distance: "10 km away",
  },
  {
    id: "5",
    name: "Aisha",
    age: 25,
    location: "Hyderabad",
    occupation: "Teacher",
    photos: ["/woman-with-family.jpg"],
    interests: ["Cooking", "Reading", "Family"],
    verified: true,
    premium: false,
    distance: "6 km away",
  },
  {
    id: "6",
    name: "Vikram",
    age: 31,
    location: "Jaipur",
    occupation: "Entrepreneur",
    photos: ["/new-profile-photo.jpg"],
    interests: ["Business", "Fitness", "Travel"],
    verified: false,
    premium: true,
    distance: "14 km away",
  },
  {
    id: "7",
    name: "Anjali",
    age: 26,
    location: "Kochi",
    occupation: "Data Analyst",
    photos: ["/professional-headshot.png"],
    interests: ["Analytics", "Hiking", "Cooking"],
    verified: true,
    premium: false,
    distance: "4 km away",
  },
  {
    id: "8",
    name: "Rohit",
    age: 28,
    location: "Chandigarh",
    occupation: "Civil Engineer",
    photos: ["/placeholder-user.jpg"],
    interests: ["Road Trips", "Food", "Music"],
    verified: false,
    premium: false,
    distance: "11 km away",
  },
  {
    id: "9",
    name: "Meera",
    age: 29,
    location: "Chennai",
    occupation: "Research Scientist",
    photos: ["/woman-at-coffee-shop.png"],
    interests: ["Science", "Classical Music", "Reading"],
    verified: true,
    premium: true,
    distance: "7 km away",
  },
  {
    id: "10",
    name: "Farhan",
    age: 27,
    location: "Lucknow",
    occupation: "Photographer",
    photos: ["/casual-outdoor-photo.jpg"],
    interests: ["Photography", "Travel", "Coffee"],
    verified: true,
    premium: false,
    distance: "9 km away",
  },
  {
    id: "11",
    name: "Riya",
    age: 24,
    location: "Kolkata",
    occupation: "Content Writer",
    photos: ["/professional-woman-smiling.png"],
    interests: ["Writing", "Books", "Cafe Hopping"],
    verified: false,
    premium: false,
    distance: "2 km away",
  },
  {
    id: "12",
    name: "Kabir",
    age: 32,
    location: "Gurgaon",
    occupation: "Finance Consultant",
    photos: ["/professional-headshot.png"],
    interests: ["Finance", "Food", "Fitness"],
    verified: true,
    premium: true,
    distance: "15 km away",
  },
]

export function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [profiles] = useState<Profile[]>(mockProfiles)

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, profession, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{filteredProfiles.length} profiles found</h2>
          </div>

          <div className="grid gap-4">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Photo */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={profile.photos[0] || "/placeholder.svg"}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                      {profile.verified && (
                        <Badge className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-primary">✓</Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {profile.name}, {profile.age}
                          </h3>
                          <p className="text-sm text-muted-foreground">{profile.occupation}</p>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{profile.distance}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-full bg-transparent">
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="w-8 h-8 p-0 rounded-full">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="flex flex-wrap gap-1">
                        {profile.interests.slice(0, 3).map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {profile.interests.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{profile.interests.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No profiles found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <FilterSheet open={showFilters} onOpenChange={setShowFilters} />
    </div>
  )
}
