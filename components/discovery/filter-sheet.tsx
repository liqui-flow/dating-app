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
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto flex flex-col">
        <SheetHeader className="space-y-3">
          <div className="flex items-center justify-between pr-12">
            <SheetTitle>Filters</SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleReset} className="bg-white/10 hover:bg-white/20 border border-white/20" style={{ color: '#FFFFFF' }}>
              Reset
            </Button>
          </div>
          <SheetDescription>Customize your discovery preferences to find better matches</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 pb-6">
          {/* Age Range */}
          <div className="space-y-4">
            <Label style={{ color: '#FFFFFF' }}>
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

          <Separator className="bg-white/10" />

          {/* Distance */}
          <div className="space-y-4">
            <Label style={{ color: '#FFFFFF' }}>Maximum distance: {filters.distance[0]} km</Label>
            <Slider
              value={filters.distance}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, distance: value as [number] }))}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Distance filtering requires location access. Enable location in the discovery screen to apply this setting.
            </p>
          </div>

          <Separator className="bg-white/10" />

          {/* Show Me */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2" style={{ color: '#FFFFFF' }}>
              <Users className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <span>Show Me</span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
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
                  className={filters.showMe === option.value 
                    ? "bg-[#97011A] hover:bg-[#7A0115] border-0" 
                    : "bg-white/10 border-white/20 hover:bg-white/20"}
                  style={{ color: '#FFFFFF' }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Interests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Interests</h3>
              <span className="text-sm" style={{ color: '#A1A1AA' }}>{filters.interests.length} selected</span>
            </div>

            <div className="space-y-4">
              {Object.entries(interestCategories).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <Label className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{category}</Label>
                  <div className="flex flex-wrap gap-2.5">
                    {items.map((interest) => (
                      <Badge
                        key={interest}
                        variant={filters.interests.includes(interest) ? "default" : "outline"}
                        className={filters.interests.includes(interest) 
                          ? "cursor-pointer bg-[#97011A] text-white border-[#97011A]/50 hover:bg-[#7A0115]" 
                          : "cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20"}
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

          <Separator className="bg-white/10" />

          {/* Relationship Goals */}
          <div className="space-y-4">
            <Label className="text-sm tracking-wide font-medium" style={{ color: '#FFFFFF' }}>Relationship Goal</Label>
            <Select 
              value={filters.relationshipGoal}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, relationshipGoal: value }))}
            >
              <SelectTrigger className="h-11 bg-white/10 border-white/20 [&_svg]:text-white/60 [&[data-placeholder]]:!text-white/60 [&_*[data-slot='select-value']]:!text-white" style={{ color: '#FFFFFF' }}>
                <SelectValue placeholder="Any relationship goal" />
              </SelectTrigger>
              <SelectContent className="bg-[#14161B] border-white/20" style={{ color: '#FFFFFF' }}>
                <SelectItem value="any" className="hover:bg-white/10 focus:bg-white/10" style={{ color: '#FFFFFF' }}>
                  Any relationship goal
                </SelectItem>
                {relationshipGoals.map((goal) => (
                  <SelectItem
                    key={goal}
                    value={goal}
                    className="hover:bg-white/10 focus:bg-white/10"
                    style={{ color: '#FFFFFF' }}
                  >
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-white/10" />

          {/* Basic Filters */}
          <div className="space-y-4">
            <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Basic Filters</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <div className="space-y-1">
                  <Label htmlFor="only-photos" style={{ color: '#FFFFFF' }}>Only show profiles with photos</Label>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Hide profiles without photos</p>
                </div>
                <Switch
                  id="only-photos"
                  checked={filters.onlyWithPhotos}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, onlyWithPhotos: checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="space-y-1">
                  <Label htmlFor="recently-active" style={{ color: '#FFFFFF' }}>Recently active</Label>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Active in the last 7 days</p>
                </div>
                <Switch
                  id="recently-active"
                  checked={filters.recentlyActive}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, recentlyActive: checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <Label htmlFor="verified-only" style={{ color: '#FFFFFF' }}>Verified profiles only</Label>
                <Switch
                  id="verified-only"
                  checked={filters.verifiedOnly}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, verifiedOnly: checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <Label htmlFor="premium-only" style={{ color: '#FFFFFF' }}>Premium members only</Label>
                <Switch
                  id="premium-only"
                  checked={filters.premiumOnly}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, premiumOnly: checked }))}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Advanced Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Advanced Filters</h3>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">Premium</Badge>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <Label className="font-medium" style={{ color: '#FFFFFF' }}>Education</Label>
              <div className="flex flex-wrap gap-2.5">
                {educationOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={filters.education.includes(option) ? "default" : "outline"}
                    className={filters.education.includes(option) 
                      ? "cursor-pointer bg-[#97011A] text-white border-[#97011A]/50 hover:bg-[#7A0115]" 
                      : "cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20"}
                    onClick={() => handleArrayToggle("education", option)}
                  >
                    {option}
                    {filters.education.includes(option) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Religion */}
            <div className="space-y-4">
              <Label className="font-medium" style={{ color: '#FFFFFF' }}>Religion</Label>
              <div className="flex flex-wrap gap-2.5">
                {religionOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={filters.religion.includes(option) ? "default" : "outline"}
                    className={filters.religion.includes(option) 
                      ? "cursor-pointer bg-[#97011A] text-white border-[#97011A]/50 hover:bg-[#7A0115]" 
                      : "cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20"}
                    onClick={() => handleArrayToggle("religion", option)}
                  >
                    {option}
                    {filters.religion.includes(option) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Lifestyle */}
            <div className="space-y-4">
              <Label className="font-medium" style={{ color: '#FFFFFF' }}>Lifestyle</Label>
              <div className="flex flex-wrap gap-2.5">
                {lifestyleOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={filters.lifestyle.includes(option) ? "default" : "outline"}
                    className={filters.lifestyle.includes(option) 
                      ? "cursor-pointer bg-[#97011A] text-white border-[#97011A]/50 hover:bg-[#7A0115]" 
                      : "cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20"}
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
        <div className="sticky bottom-0 bg-[#14161B] border-t border-white/20 px-6 py-5">
          <Button onClick={handleSave} className="w-full bg-[#97011A] hover:bg-[#7A0115] text-white" size="lg" disabled={saving || loading}>
            {saving ? "Saving..." : loading ? "Loading..." : "Save Preferences"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
