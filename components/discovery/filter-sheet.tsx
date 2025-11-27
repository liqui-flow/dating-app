"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Users } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFiltersSaved?: () => void
}

const educationOptions = ["High School", "Bachelor's Degree", "Master's Degree", "PhD", "Trade School", "Some College"]

const religionOptions = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other", "Prefer not to say"]

const lifestyleOptions = [
  "Non-smoker",
  "Social drinker",
  "Non-drinker",
  "Vegetarian",
  "Vegan",
  "Fitness enthusiast",
  "Pet lover",
]

type FilterState = {
  ageRange: [number, number]
  distance: [number]
  showMe: "women" | "men" | "everyone"
  interests: string[]
  relationshipGoal: string
  verifiedOnly: boolean
  premiumOnly: boolean
  onlyWithPhotos: boolean
  recentlyActive: boolean
  education: string[]
  religion: string[]
  lifestyle: string[]
}

const getDefaultFilters = (): FilterState => ({
  ageRange: [22, 35],
  distance: [50],
  showMe: "everyone",
  interests: [],
  relationshipGoal: "any",
  verifiedOnly: false,
  premiumOnly: false,
  onlyWithPhotos: true,
  recentlyActive: false,
  education: [],
  religion: [],
  lifestyle: [],
})

const mapFiltersToPreferences = (state: FilterState) => ({
  min_age: state.ageRange[0],
  max_age: state.ageRange[1],
  max_distance: state.distance[0],
  looking_for: state.showMe,
  only_with_photos: state.onlyWithPhotos,
  recently_active: state.recentlyActive,
  verified_only: state.verifiedOnly,
  premium_only: state.premiumOnly,
  education: state.education,
  religion: state.religion,
  lifestyle: state.lifestyle,
  interests: state.interests,
  relationship_goal: state.relationshipGoal,
})

export function FilterSheet({ open, onOpenChange, onFiltersSaved }: FilterSheetProps) {
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadPreferences()
    }
  }, [open])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile, error } = await supabase
        .from('dating_profile_full')
        .select('preferences')
        .eq('user_id', user.id)
        .single()

      if (!error && profile?.preferences) {
        const prefs = profile.preferences as any
        setFilters({
          ageRange: [prefs.min_age || 22, prefs.max_age || 35],
          distance: [prefs.max_distance || 50],
          showMe: prefs.looking_for || "everyone",
          interests: prefs.interests || [],
          relationshipGoal: prefs.relationship_goal || "any",
          verifiedOnly: prefs.verified_only || false,
          premiumOnly: prefs.premium_only || false,
          onlyWithPhotos: prefs.only_with_photos !== undefined ? prefs.only_with_photos : true,
          recentlyActive: prefs.recently_active || false,
          education: prefs.education || [],
          religion: prefs.religion || [],
          lifestyle: prefs.lifestyle || [],
        })
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const persistPreferences = async (state: FilterState) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("Please log in to update preferences")
    }

    const preferences = mapFiltersToPreferences(state)

    const { error } = await supabase
      .from('dating_profile_full')
      .update({ preferences })
      .eq('user_id', user.id)

    if (error) throw error
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await persistPreferences(filters)

      toast({
        title: "Preferences Saved",
        description: "Your discovery preferences have been saved successfully.",
      })

      onOpenChange(false)
      
      // Trigger refresh callback
      if (onFiltersSaved) {
        onFiltersSaved()
      }
    } catch (error: any) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

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

  const handleReset = async () => {
    try {
      setSaving(true)
      const defaults = getDefaultFilters()
      setFilters(defaults)
      await persistPreferences(defaults)
      toast({
        title: "Filters reset",
        description: "Default discovery preferences applied.",
      })
      onFiltersSaved?.()
    } catch (error: any) {
      console.error("Error resetting preferences:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to reset preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleArrayToggle = (key: "education" | "religion" | "lifestyle", value: string) => {
    const currentArray = filters[key]
    setFilters((prev) => ({
      ...prev,
      [key]: currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value],
    }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
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
              onValueChange={(value) => setFilters((prev) => ({ ...prev, distance: value as [number] }))}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Distance filtering requires location access. Enable location in the discovery screen to apply this setting.
            </p>
          </div>

          <Separator />

          {/* Show Me */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Show Me</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "women", label: "Women" },
                { value: "men", label: "Men" },
                { value: "everyone", label: "Everyone" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={filters.showMe === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters((prev) => ({ ...prev, showMe: option.value as any }))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
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

          {/* Basic Filters */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Filters</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="only-photos">Only show profiles with photos</Label>
                  <p className="text-xs text-muted-foreground">Hide profiles without photos</p>
                </div>
                <Switch
                  id="only-photos"
                  checked={filters.onlyWithPhotos}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, onlyWithPhotos: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="recently-active">Recently active</Label>
                  <p className="text-xs text-muted-foreground">Active in the last 7 days</p>
                </div>
                <Switch
                  id="recently-active"
                  checked={filters.recentlyActive}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, recentlyActive: checked }))}
                />
              </div>

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

          {/* Advanced Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Advanced Filters</h3>
              <Badge variant="secondary" className="text-xs">Premium</Badge>
            </div>

            {/* Education */}
            <div className="space-y-3">
              <Label className="font-medium">Education</Label>
              <div className="flex flex-wrap gap-2">
                {educationOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={filters.education.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleArrayToggle("education", option)}
                  >
                    {option}
                    {filters.education.includes(option) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Religion */}
            <div className="space-y-3">
              <Label className="font-medium">Religion</Label>
              <div className="flex flex-wrap gap-2">
                {religionOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={filters.religion.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleArrayToggle("religion", option)}
                  >
                    {option}
                    {filters.religion.includes(option) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Lifestyle */}
            <div className="space-y-3">
              <Label className="font-medium">Lifestyle</Label>
              <div className="flex flex-wrap gap-2">
                {lifestyleOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={filters.lifestyle.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleArrayToggle("lifestyle", option)}
                  >
                    {option}
                    {filters.lifestyle.includes(option) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <Button onClick={handleSave} className="w-full" size="lg" disabled={saving || loading}>
            {saving ? "Saving..." : loading ? "Loading..." : "Save Preferences"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
