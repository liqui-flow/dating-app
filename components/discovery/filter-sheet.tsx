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

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilterSheet({ open, onOpenChange }: FilterSheetProps) {
  const [filters, setFilters] = useState({
    ageRange: [22, 35],
    distance: [25],
    education: "any",
    occupation: "any",
    religion: "any",
    smoking: "any",
    drinking: "any",
    diet: "any",
    verifiedOnly: false,
    premiumOnly: false,
    interests: [] as string[],
  })

  const availableInterests = [
    "Travel",
    "Cooking",
    "Fitness",
    "Reading",
    "Music",
    "Movies",
    "Art",
    "Sports",
    "Photography",
    "Dancing",
    "Gaming",
    "Hiking",
    "Yoga",
    "Fashion",
    "Technology",
    "Food",
  ]

  const handleInterestToggle = (interest: string) => {
    setFilters((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleReset = () => {
    setFilters({
      ageRange: [22, 35],
      distance: [25],
      education: "any",
      occupation: "any",
      religion: "any",
      smoking: "any",
      drinking: "any",
      diet: "any",
      verifiedOnly: false,
      premiumOnly: false,
      interests: [],
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
            <SheetTitle>Filters</SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
          <SheetDescription>Customize your discovery preferences to find better matches</SheetDescription>
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

          {/* Distance */}
          <div className="space-y-3">
            <Label>Maximum distance: {filters.distance[0]} km</Label>
            <Slider
              value={filters.distance}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, distance: value }))}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Education & Occupation */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Education</Label>
              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, education: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any education level</SelectItem>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="some-college">Some College</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="professional">Professional Degree</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Occupation</Label>
              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, occupation: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any occupation</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Cultural Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold">Cultural Preferences</h3>

            <div className="space-y-2">
              <Label>Religion</Label>
              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, religion: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any religion</SelectItem>
                  <SelectItem value="hindu">Hindu</SelectItem>
                  <SelectItem value="muslim">Muslim</SelectItem>
                  <SelectItem value="christian">Christian</SelectItem>
                  <SelectItem value="sikh">Sikh</SelectItem>
                  <SelectItem value="buddhist">Buddhist</SelectItem>
                  <SelectItem value="jain">Jain</SelectItem>
                  <SelectItem value="jewish">Jewish</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Lifestyle */}
          <div className="space-y-4">
            <h3 className="font-semibold">Lifestyle</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Smoking</Label>
                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, smoking: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="socially">Socially</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Drinking</Label>
                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, drinking: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="socially">Socially</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Diet</Label>
              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, diet: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any diet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any diet</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="pescatarian">Pescatarian</SelectItem>
                </SelectContent>
              </Select>
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

          <Separator />

          {/* Interests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Interests</h3>
              <span className="text-sm text-muted-foreground">{filters.interests.length} selected</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant={filters.interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                  {filters.interests.includes(interest) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <Button onClick={handleApply} className="w-full" size="lg">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
