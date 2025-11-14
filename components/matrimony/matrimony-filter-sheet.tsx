"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface MatrimonyFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MatrimonyFilterSheet({ open, onOpenChange }: MatrimonyFilterSheetProps) {
  const [filters, setFilters] = useState({
    ageRange: [21, 35],
    heightRange: [150, 190], // in cm
    locations: [] as string[],
    educationPrefs: [] as string[],
    professionPrefs: [] as string[],
    communities: [] as string[],
    familyTypePrefs: [] as string[],
    dietPrefs: [] as string[],
    lifestylePrefs: [] as string[],
    verifiedOnly: false,
    premiumOnly: false,
  })

  const locationOptions = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", 
    "Pune", "Ahmedabad", "Jaipur", "Surat", "USA", "Canada", "UK", 
    "Australia", "Singapore", "Dubai", "Any"
  ]

  const educationOptions = [
    "Any professional degree", "MBA", "B.Tech", "MBBS", "CA", "CS", 
    "Ph.D", "Masters", "Bachelors", "Diploma", "Any"
  ]

  const professionOptions = [
    "IT background", "Same profession", "Business", "Doctor", "Engineer", 
    "Teacher", "Government job", "Private sector", "Entrepreneur", "Any"
  ]

  const communityOptions = [
    "Any", "Brahmin", "Kshatriya", "Vaishya", "Shudra", "Jain", 
    "Sikh", "Muslim", "Christian", "Buddhist", "Other"
  ]

  const familyTypeOptions = [
    "Nuclear", "Joint", "Any"
  ]

  const dietOptions = [
    "Open to both", "Strictly vegetarian", "Non-vegetarian", "Jain vegetarian", "Any"
  ]

  const lifestyleOptions = [
    "Non-smoker", "Non-drinker", "Occasional drinker", "Social drinker", "Any"
  ]

  const handleArrayToggle = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const handleReset = () => {
    setFilters({
      ageRange: [21, 35],
      heightRange: [150, 190],
      locations: [],
      educationPrefs: [],
      professionPrefs: [],
      communities: [],
      familyTypePrefs: [],
      dietPrefs: [],
      lifestylePrefs: [],
      verifiedOnly: false,
      premiumOnly: false,
    })
  }

  const handleApply = () => {
    // Apply filters logic here
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle>Matrimony Filters</SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
          <SheetDescription>Customize your matrimony preferences to find your perfect life partner</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Age Range */}
          <div className="space-y-3">
            <Label>
              Age range: {filters.ageRange[0]} - {filters.ageRange[1]} years
            </Label>
            <Slider
              value={filters.ageRange}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, ageRange: value }))}
              max={60}
              min={18}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Height Range */}
          <div className="space-y-3">
            <Label>
              Height range: {filters.heightRange[0]} - {filters.heightRange[1]} cm
            </Label>
            <Slider
              value={filters.heightRange}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, heightRange: value }))}
              max={250}
              min={90}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Locations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Location Preferences</h3>
              <span className="text-sm text-muted-foreground">{filters.locations.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map((location) => (
                <Badge
                  key={location}
                  variant={filters.locations.includes(location) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleArrayToggle(filters.locations, location, (value) => setFilters(prev => ({ ...prev, locations: value })))}
                >
                  {location}
                  {filters.locations.includes(location) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Education Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Education Preferences</h3>
              <span className="text-sm text-muted-foreground">{filters.educationPrefs.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {educationOptions.map((education) => (
                <Badge
                  key={education}
                  variant={filters.educationPrefs.includes(education) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleArrayToggle(filters.educationPrefs, education, (value) => setFilters(prev => ({ ...prev, educationPrefs: value })))}
                >
                  {education}
                  {filters.educationPrefs.includes(education) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Profession Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Profession Preferences</h3>
              <span className="text-sm text-muted-foreground">{filters.professionPrefs.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {professionOptions.map((profession) => (
                <Badge
                  key={profession}
                  variant={filters.professionPrefs.includes(profession) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleArrayToggle(filters.professionPrefs, profession, (value) => setFilters(prev => ({ ...prev, professionPrefs: value })))}
                >
                  {profession}
                  {filters.professionPrefs.includes(profession) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Community Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Community/Caste Preferences</h3>
              <span className="text-sm text-muted-foreground">{filters.communities.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {communityOptions.map((community) => (
                <Badge
                  key={community}
                  variant={filters.communities.includes(community) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleArrayToggle(filters.communities, community, (value) => setFilters(prev => ({ ...prev, communities: value })))}
                >
                  {community}
                  {filters.communities.includes(community) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Family Type Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Family Type Preferences</h3>
              <span className="text-sm text-muted-foreground">{filters.familyTypePrefs.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {familyTypeOptions.map((familyType) => (
                <Badge
                  key={familyType}
                  variant={filters.familyTypePrefs.includes(familyType) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleArrayToggle(filters.familyTypePrefs, familyType, (value) => setFilters(prev => ({ ...prev, familyTypePrefs: value })))}
                >
                  {familyType}
                  {filters.familyTypePrefs.includes(familyType) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Dietary Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Dietary Preferences</h3>
              <span className="text-sm text-muted-foreground">{filters.dietPrefs.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dietOptions.map((diet) => (
                <Badge
                  key={diet}
                  variant={filters.dietPrefs.includes(diet) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleArrayToggle(filters.dietPrefs, diet, (value) => setFilters(prev => ({ ...prev, dietPrefs: value })))}
                >
                  {diet}
                  {filters.dietPrefs.includes(diet) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Lifestyle Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Lifestyle Preferences</h3>
              <span className="text-sm text-muted-foreground">{filters.lifestylePrefs.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lifestyleOptions.map((lifestyle) => (
                <Badge
                  key={lifestyle}
                  variant={filters.lifestylePrefs.includes(lifestyle) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleArrayToggle(filters.lifestylePrefs, lifestyle, (value) => setFilters(prev => ({ ...prev, lifestylePrefs: value })))}
                >
                  {lifestyle}
                  {filters.lifestylePrefs.includes(lifestyle) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Account Type */}
          <div className="space-y-4">
            <h3 className="font-semibold">Account Type</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="verified-only">Verified profiles only</Label>
                <Switch
                  id="verified-only"
                  checked={filters.verifiedOnly}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, verifiedOnly: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="premium-only">Premium members only</Label>
                <Switch
                  id="premium-only"
                  checked={filters.premiumOnly}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, premiumOnly: checked }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="sticky bottom-0 border-t border-border p-4">
          <Button onClick={handleApply} className="w-full" size="lg">
            Apply Matrimony Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
