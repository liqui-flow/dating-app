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
    interests: [] as string[],
    relationshipGoal: "any",
    verifiedOnly: false,
    premiumOnly: false,
  })

  const interestCategories = {
    Art: ["Painting", "Photography", "Digital Art"],
    Food: ["Foodie", "Cooking", "Trying new restaurants"],
    Entertainment: ["Binge-watching", "Podcasts", "Stand-up comedy", "Live music"],
    Lifestyle: ["Thrifting", "DIY Projects", "Volunteering", "Wellness", "Homebody"],
  }

  const relationshipGoals = [
    "Serious relationship leading to marriage",
    "Long-term relationship",
    "Dating to see where it goes",
    "New friends and connections",
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
      interests: [],
      relationshipGoal: "any",
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

          {/* Interests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Interests</h3>
              <span className="text-sm text-muted-foreground">{filters.interests.length} selected</span>
            </div>

            <div className="space-y-3">
              {Object.entries(interestCategories).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <Label className="text-sm font-medium">{category}</Label>
                  <div className="flex flex-wrap gap-2">
                    {items.map((interest) => (
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
              ))}
            </div>
          </div>

          <Separator />

          {/* Relationship Goals */}
          <div className="space-y-3">
            <Label className="text-white/80 text-sm tracking-wide">Relationship Goal</Label>
            <Select 
              value={filters.relationshipGoal}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, relationshipGoal: value }))}
            >
              <SelectTrigger className="h-11 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-200 px-4">
                <SelectValue placeholder="Any relationship goal" className="text-white" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 text-black border border-white/40 shadow-[0_15px_40px_rgba(0,0,0,0.3)] rounded-2xl">
                <SelectItem value="any" className="text-sm data-[state=checked]:bg-black/5 data-[state=checked]:text-black rounded-xl">
                  Any relationship goal
                </SelectItem>
                {relationshipGoals.map((goal) => (
                  <SelectItem
                    key={goal}
                    value={goal}
                    className="text-sm data-[state=checked]:bg-black/5 data-[state=checked]:text-black rounded-xl"
                  >
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <Button onClick={handleApply} className="w-full" size="lg">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
