"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, X, Save, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { StaticBackground } from "@/components/discovery/static-background"
import { useToast } from "@/hooks/use-toast"
import type { DatingProfileFull } from "@/lib/datingProfileService"
import type { MatrimonyProfileFull } from "@/lib/matrimonyService"
import { saveDatingPreferences, uploadProfilePhoto } from "@/lib/datingProfileService"
import { uploadAsset } from "@/lib/matrimonyService"

interface EditProfileProps {
  onBack: () => void
  onSave?: () => void
  mode?: 'dating' | 'matrimony' // Required: determines which profile table to use
}

const photoPrompts = [
  "Me in my element",
  "What I look like on a Sunday morning",
  "My favorite thing to do",
  "Candid shot (no filters!)",
  "Just being me",
  "Another great photo"
]

const datingPrompts = [
  "My ideal first date is...",
  "I'm looking for someone who...",
  "My love language is...",
  "My most controversial opinion is...",
  "I'm currently obsessed with...",
  "My biggest green flag is...",
]

const interestCategories = {
  Art: ["Painting", "Photography", "Digital Art"],
  Food: ["Foodie", "Cooking", "Trying new restaurants"],
  Entertainment: ["Binge-watching", "Podcasts", "Stand-up comedy", "Live music"],
  Lifestyle: ["Thrifting", "DIY Projects", "Volunteering", "Wellness", "Homebody"],
}

const thisOrThatPairs = [
  ["Stay in on a Friday night", "Go out and see where the night takes you"],
  ["Long conversations", "Quick wit and banter"],
  ["Ambitious and career-focused", "Laid-back and enjoy the journey"],
  ["Big celebrations", "Small, intimate moments"],
]

const intentions = [
  "Serious relationship leading to marriage",
  "Long-term relationship",
  "Dating to see where it goes",
  "New friends and connections",
]

export function EditProfile({ onBack, onSave, mode }: EditProfileProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userPath, setUserPath] = useState<'dating' | 'matrimony' | null>(null)
  const [datingProfile, setDatingProfile] = useState<DatingProfileFull | null>(null)
  const [matrimonyProfile, setMatrimonyProfile] = useState<MatrimonyProfileFull | null>(null)
  const [activeTab, setActiveTab] = useState("photos")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Dating profile state
  const [datingPhotos, setDatingPhotos] = useState<Array<{ url: string; file?: File; caption?: string }>>([])
  const [datingBio, setDatingBio] = useState("")
  const [datingPromptsData, setDatingPromptsData] = useState<Array<{ prompt: string; answer: string }>>([])
  const [datingInterests, setDatingInterests] = useState<string[]>([])
  const [datingThisOrThat, setDatingThisOrThat] = useState<Record<number, 0 | 1 | null>>({})
  const [datingRelationshipGoal, setDatingRelationshipGoal] = useState("")
  const [datingLookingFor, setDatingLookingFor] = useState<'men' | 'women' | 'everyone'>('everyone')
  const [datingShowOnProfile, setDatingShowOnProfile] = useState(true)
  const [datingAgeRange, setDatingAgeRange] = useState<[number, number]>([21, 35])
  const [datingDistance, setDatingDistance] = useState([25])

  // Matrimony profile state
  const [matrimonyPhotos, setMatrimonyPhotos] = useState<Array<{ url: string; file?: File }>>([])
  const [matrimonyBio, setMatrimonyBio] = useState("")
  const [matrimonyPersonal, setMatrimonyPersonal] = useState<any>({})
  const [matrimonyCareer, setMatrimonyCareer] = useState<any>({})
  const [matrimonyFamily, setMatrimonyFamily] = useState<any>({})
  const [matrimonyCultural, setMatrimonyCultural] = useState<any>({})
  const [matrimonyPreferences, setMatrimonyPreferences] = useState<any>({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Use mode prop to determine which profile to load, NOT selected_path
      // Mode is determined by the current context (which page/route we're on)
      const currentMode = mode || 'dating' // Default to dating for backward compatibility
      setUserPath(currentMode)

      if (currentMode === 'dating') {
        // ALWAYS fetch from dating_profile_full when in dating mode
        const { data, error } = await supabase
          .from('dating_profile_full')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!error && data) {
          setDatingProfile(data as DatingProfileFull)
          // Initialize state from profile
          const photoUrls = (data.photos as string[] || [])
          const photoPrompts = (data.photo_prompts as string[] || [])
          const photos = photoUrls.map((url, index) => ({ 
            url, 
            caption: photoPrompts[index] || "" 
          }))
          setDatingPhotos(photos)
          setDatingBio(data.bio || "")
          setDatingPromptsData((data.prompts as Array<{ prompt: string; answer: string }>) || [])
          setDatingInterests((data.interests as string[]) || [])
          const thisOrThat = (data.this_or_that_choices as Array<{ option_a: string; option_b: string; selected: 0 | 1; question_index?: number }>) || []
          const thisOrThatMap: Record<number, 0 | 1 | null> = {}
          thisOrThat.forEach(choice => {
            if (choice.question_index !== undefined) {
              thisOrThatMap[choice.question_index] = choice.selected
            }
          })
          setDatingThisOrThat(thisOrThatMap)
          setDatingRelationshipGoal(data.relationship_goals || "")
          const prefs = data.preferences || {}
          setDatingLookingFor(prefs.looking_for || 'everyone')
          setDatingShowOnProfile(prefs.show_on_profile !== false)
          setDatingAgeRange([prefs.min_age || 21, prefs.max_age || 35])
          setDatingDistance([prefs.max_distance || 25])
        }
      } else if (currentMode === 'matrimony') {
        // ALWAYS fetch from matrimony_profile_full when in matrimony mode
        const { data, error } = await supabase
          .from('matrimony_profile_full')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!error && data) {
          setMatrimonyProfile(data as MatrimonyProfileFull)
          // Initialize state from profile
          const photos = (data.photos as string[] || []).map(url => ({ url }))
          setMatrimonyPhotos(photos)
          setMatrimonyBio(data.bio || "")
          setMatrimonyPersonal(data.personal || {})
          setMatrimonyCareer(data.career || {})
          setMatrimonyFamily(data.family || {})
          setMatrimonyCultural(data.cultural || {})
          setMatrimonyPreferences(data.partner_preferences || {})
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newPhotos: Array<{ url: string; file: File; caption?: string }> = []
      const maxPhotos = 6
      const currentPhotos = userPath === 'dating' ? datingPhotos : matrimonyPhotos
      const remainingSlots = maxPhotos - currentPhotos.length

      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const file = files[i]
        newPhotos.push({
          url: URL.createObjectURL(file),
          file,
          caption: ""
        })
      }

      if (userPath === 'dating') {
        setDatingPhotos(prev => [...prev, ...newPhotos])
      } else {
        setMatrimonyPhotos(prev => [...prev, ...newPhotos])
      }
    }
  }

  const removePhoto = (index: number) => {
    if (userPath === 'dating') {
      setDatingPhotos(prev => prev.filter((_, i) => i !== index))
    } else {
      setMatrimonyPhotos(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updatePhotoCaption = (index: number, caption: string) => {
    if (userPath === 'dating') {
      setDatingPhotos(prev => prev.map((photo, i) => i === index ? { ...photo, caption } : photo))
    }
  }

  const addPrompt = () => {
    // Get available prompts (not already used)
    const usedPrompts = datingPromptsData.map(p => p.prompt).filter(Boolean)
    const availablePrompts = datingPrompts.filter(p => !usedPrompts.includes(p))
    
    if (availablePrompts.length > 0) {
      setDatingPromptsData(prev => [...prev, { prompt: availablePrompts[0], answer: "" }])
    } else {
      setDatingPromptsData(prev => [...prev, { prompt: "", answer: "" }])
    }
  }

  const removePrompt = (index: number) => {
    setDatingPromptsData(prev => prev.filter((_, i) => i !== index))
  }

  const updatePrompt = (index: number, field: 'prompt' | 'answer', value: string) => {
    setDatingPromptsData(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const toggleInterest = (interest: string) => {
    setDatingInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest])
  }

  const toggleThisOrThat = (index: number, choice: 0 | 1) => {
    setDatingThisOrThat(prev => ({
      ...prev,
      [index]: prev[index] === choice ? null : choice
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to continue",
          variant: "destructive"
        })
        return
      }

      if (userPath === 'dating') {
        // Upload new photos
        const photoUrls: string[] = []
        const photoPrompts: string[] = []
        for (const photo of datingPhotos) {
          if (photo.file) {
            // Upload new photo using the dating profile service
            const uploadResult = await uploadProfilePhoto(user.id, photo.file)
            if (uploadResult.success && uploadResult.data) {
              photoUrls.push(uploadResult.data)
            } else {
              console.error("Failed to upload photo:", uploadResult.error)
            }
          } else {
            // Keep existing photo URL
            photoUrls.push(photo.url)
          }
          // Save caption for each photo
          photoPrompts.push(photo.caption || "")
        }

        // Update profile
        const { data: existing } = await supabase
          .from('dating_profile_full')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        const updateData: any = {
          user_id: user.id,
          name: existing?.name || '',
          photos: photoUrls,
          photo_prompts: photoPrompts,
          bio: datingBio,
          prompts: datingPromptsData.filter(p => p.prompt && p.answer),
          interests: datingInterests,
          this_or_that_choices: Object.entries(datingThisOrThat)
            .filter(([_, selected]) => selected !== null)
            .map(([indexStr, selected]) => {
              const index = parseInt(indexStr)
              const [optionA, optionB] = thisOrThatPairs[index]
              return {
                option_a: optionA,
                option_b: optionB,
                selected: selected as 0 | 1,
                question_index: index
              }
            }),
          relationship_goals: datingRelationshipGoal,
          preferences: {
            looking_for: datingLookingFor,
            show_on_profile: datingShowOnProfile,
            min_age: datingAgeRange[0],
            max_age: datingAgeRange[1],
            max_distance: datingDistance[0]
          }
        }

        // Preserve other fields
        if (existing) {
          updateData.dob = existing.dob
          updateData.gender = existing.gender
          updateData.video_url = existing.video_url
          updateData.video_file_name = existing.video_file_name
          updateData.setup_completed = existing.setup_completed
          updateData.preferences_completed = existing.preferences_completed
          updateData.questionnaire_completed = existing.questionnaire_completed
        }

        const { error } = await supabase
          .from('dating_profile_full')
          .upsert(updateData, { onConflict: 'user_id' })

        if (error) throw error

        // Save preferences separately
        await saveDatingPreferences(
          user.id,
          datingLookingFor,
          datingShowOnProfile,
          datingAgeRange[0],
          datingAgeRange[1],
          datingDistance[0]
        )

      } else if (userPath === 'matrimony') {
        // Upload new photos
        const photoUrls: string[] = []
        for (const photo of matrimonyPhotos) {
          if (photo.file) {
            const url = await uploadAsset(photo.file)
            photoUrls.push(url)
          } else {
            photoUrls.push(photo.url)
          }
        }

        // Update profile
        const { data: existing } = await supabase
          .from('matrimony_profile_full')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        const updateData: any = {
          user_id: user.id,
          name: existing?.name || '',
          age: existing?.age,
          gender: existing?.gender,
          created_by: existing?.created_by,
          photos: photoUrls,
          bio: matrimonyBio,
          personal: matrimonyPersonal,
          career: matrimonyCareer,
          family: matrimonyFamily,
          cultural: matrimonyCultural,
          partner_preferences: matrimonyPreferences
        }

        // Preserve step completion flags
        if (existing) {
          updateData.step1_completed = existing.step1_completed
          updateData.step2_completed = existing.step2_completed
          updateData.step3_completed = existing.step3_completed
          updateData.step4_completed = existing.step4_completed
          updateData.step5_completed = existing.step5_completed
          updateData.step6_completed = existing.step6_completed
          updateData.step7_completed = existing.step7_completed
          updateData.profile_completed = existing.profile_completed
        }

        const { error } = await supabase
          .from('matrimony_profile_full')
          .upsert(updateData, { onConflict: 'user_id' })

        if (error) throw error
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      onSave?.()
      onBack()
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <StaticBackground />
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const currentPhotos = userPath === 'dating' ? datingPhotos : matrimonyPhotos

  return (
    <div className="min-h-screen relative">
      <StaticBackground />
      <div className="sticky top-0 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Edit Profile</h1>
          <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="photos">Edit Photos</TabsTrigger>
            <TabsTrigger value="about">Edit About Myself</TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">Your Photos</h2>
                <p className="text-sm text-muted-foreground">
                  Add up to 6 photos to showcase yourself ({currentPhotos.length}/6)
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-border bg-muted">
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        {index + 1}
                      </div>
                    </div>
                    {userPath === 'dating' && (
                      <Input
                        placeholder={photoPrompts[index] || "Caption (optional)"}
                        value={photo.caption || ""}
                        onChange={(e) => updatePhotoCaption(index, e.target.value)}
                        className="text-xs mt-2"
                      />
                    )}
                  </div>
                ))}
                
                {currentPhotos.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Add Photo</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            {userPath === 'dating' ? (
              <>
                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      value={datingBio}
                      onChange={(e) => setDatingBio(e.target.value)}
                      rows={4}
                    />
                  </CardContent>
                </Card>

                {/* Prompts */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Prompts</CardTitle>
                      <Button size="sm" variant="outline" onClick={addPrompt}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Prompt
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {datingPromptsData.map((prompt, index) => {
                      // Get available prompts (not already used by other prompts)
                      const usedPrompts = datingPromptsData
                        .map((p, i) => i !== index ? p.prompt : "")
                        .filter(Boolean)
                      const availablePrompts = datingPrompts.filter(p => !usedPrompts.includes(p))
                      
                      return (
                        <div key={index} className="space-y-2 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <Label>Prompt {index + 1}</Label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removePrompt(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Prompt Question:</Label>
                            {prompt.prompt ? (
                              // Display selected prompt as read-only text
                              <div className="p-2.5 bg-muted rounded-md text-sm font-medium border">
                                {prompt.prompt}
                              </div>
                            ) : (
                              // Show dropdown only when no prompt is selected
                              <Select
                                value=""
                                onValueChange={(value) => updatePrompt(index, 'prompt', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a prompt..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availablePrompts.map((p) => (
                                    <SelectItem key={p} value={p}>
                                      {p}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          {prompt.prompt && (
                            <Textarea
                              placeholder="Your answer..."
                              value={prompt.answer}
                              onChange={(e) => updatePrompt(index, 'answer', e.target.value)}
                              rows={2}
                            />
                          )}
                        </div>
                      )
                    })}
                    {datingPromptsData.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No prompts yet. Click "Add Prompt" to add one.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Interests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Interests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(interestCategories).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <Label className="text-sm font-medium">{category}</Label>
                        <div className="flex flex-wrap gap-2">
                          {items.map((interest) => (
                            <Badge
                              key={interest}
                              variant={datingInterests.includes(interest) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleInterest(interest)}
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* This or That */}
                <Card>
                  <CardHeader>
                    <CardTitle>This or That</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {thisOrThatPairs.map(([optionA, optionB], index) => {
                      const selected = datingThisOrThat[index]
                      return (
                        <div key={index} className="grid grid-cols-2 gap-3">
                          <Button
                            variant={selected === 0 ? "default" : "outline"}
                            onClick={() => toggleThisOrThat(index, 0)}
                            className="h-auto p-4 text-left"
                          >
                            {optionA}
                          </Button>
                          <Button
                            variant={selected === 1 ? "default" : "outline"}
                            onClick={() => toggleThisOrThat(index, 1)}
                            className="h-auto p-4 text-left"
                          >
                            {optionB}
                          </Button>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Relationship Goals */}
                <Card>
                  <CardHeader>
                    <CardTitle>Relationship Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {intentions.map((intention) => (
                        <Button
                          key={intention}
                          variant={datingRelationshipGoal === intention ? "default" : "outline"}
                          onClick={() => setDatingRelationshipGoal(intention)}
                          className="justify-start h-auto p-4"
                        >
                          {intention}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dating Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Looking for</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={datingLookingFor === 'men' ? "default" : "outline"}
                          onClick={() => setDatingLookingFor('men')}
                        >
                          Men
                        </Button>
                        <Button
                          variant={datingLookingFor === 'women' ? "default" : "outline"}
                          onClick={() => setDatingLookingFor('women')}
                        >
                          Women
                        </Button>
                        <Button
                          variant={datingLookingFor === 'everyone' ? "default" : "outline"}
                          onClick={() => setDatingLookingFor('everyone')}
                        >
                          Everyone
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Show on profile</Label>
                      <Button
                        variant={datingShowOnProfile ? "default" : "outline"}
                        onClick={() => setDatingShowOnProfile(!datingShowOnProfile)}
                      >
                        {datingShowOnProfile ? "Yes" : "No"}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Age range: {datingAgeRange[0]} - {datingAgeRange[1]} years</Label>
                      <Slider
                        value={datingAgeRange as any}
                        onValueChange={(val: number[]) => {
                          const [min, max] = val as [number, number]
                          const clampedMin = Math.max(18, Math.min(min, 60))
                          const clampedMax = Math.max(18, Math.min(max, 60))
                          if (clampedMin <= clampedMax) {
                            setDatingAgeRange([clampedMin, clampedMax])
                          }
                        }}
                        min={18}
                        max={60}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum distance: {datingDistance[0]} km</Label>
                      <Slider
                        value={datingDistance}
                        onValueChange={setDatingDistance}
                        max={100}
                        min={5}
                        step={5}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      value={matrimonyBio}
                      onChange={(e) => setMatrimonyBio(e.target.value)}
                      rows={4}
                    />
                  </CardContent>
                </Card>

                {/* Personal Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Height (cm)</Label>
                        <Input
                          type="number"
                          value={matrimonyPersonal.height_cm || ""}
                          onChange={(e) => setMatrimonyPersonal({ ...matrimonyPersonal, height_cm: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Complexion</Label>
                        <Input
                          value={matrimonyPersonal.complexion || ""}
                          onChange={(e) => setMatrimonyPersonal({ ...matrimonyPersonal, complexion: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Diet</Label>
                        <Input
                          value={matrimonyPersonal.diet || ""}
                          onChange={(e) => setMatrimonyPersonal({ ...matrimonyPersonal, diet: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Body Type</Label>
                        <Input
                          value={matrimonyPersonal.body_type || ""}
                          onChange={(e) => setMatrimonyPersonal({ ...matrimonyPersonal, body_type: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Career */}
                <Card>
                  <CardHeader>
                    <CardTitle>Career & Education</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Highest Education</Label>
                        <Input
                          value={matrimonyCareer.highest_education || ""}
                          onChange={(e) => setMatrimonyCareer({ ...matrimonyCareer, highest_education: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input
                          value={matrimonyCareer.job_title || ""}
                          onChange={(e) => setMatrimonyCareer({ ...matrimonyCareer, job_title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={matrimonyCareer.company || ""}
                          onChange={(e) => setMatrimonyCareer({ ...matrimonyCareer, company: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Annual Income</Label>
                        <Input
                          value={matrimonyCareer.annual_income || ""}
                          onChange={(e) => setMatrimonyCareer({ ...matrimonyCareer, annual_income: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Family */}
                <Card>
                  <CardHeader>
                    <CardTitle>Family Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Family Type</Label>
                        <Input
                          value={matrimonyFamily.family_type || ""}
                          onChange={(e) => setMatrimonyFamily({ ...matrimonyFamily, family_type: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Father's Occupation</Label>
                        <Input
                          value={matrimonyFamily.father_occupation || ""}
                          onChange={(e) => setMatrimonyFamily({ ...matrimonyFamily, father_occupation: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mother's Occupation</Label>
                        <Input
                          value={matrimonyFamily.mother_occupation || ""}
                          onChange={(e) => setMatrimonyFamily({ ...matrimonyFamily, mother_occupation: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Brothers</Label>
                        <Input
                          type="number"
                          value={matrimonyFamily.brothers || ""}
                          onChange={(e) => setMatrimonyFamily({ ...matrimonyFamily, brothers: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sisters</Label>
                        <Input
                          type="number"
                          value={matrimonyFamily.sisters || ""}
                          onChange={(e) => setMatrimonyFamily({ ...matrimonyFamily, sisters: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cultural */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cultural Background</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Religion</Label>
                        <Input
                          value={matrimonyCultural.religion || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, religion: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mother Tongue</Label>
                        <Input
                          value={matrimonyCultural.mother_tongue || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, mother_tongue: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Community</Label>
                        <Input
                          value={matrimonyCultural.community || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, community: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gotra</Label>
                        <Input
                          value={matrimonyCultural.gotra || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, gotra: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Partner Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Partner Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Min Age</Label>
                        <Input
                          type="number"
                          value={matrimonyPreferences.min_age || ""}
                          onChange={(e) => setMatrimonyPreferences({ ...matrimonyPreferences, min_age: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Age</Label>
                        <Input
                          type="number"
                          value={matrimonyPreferences.max_age || ""}
                          onChange={(e) => setMatrimonyPreferences({ ...matrimonyPreferences, max_age: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Height (cm)</Label>
                        <Input
                          type="number"
                          value={matrimonyPreferences.min_height_cm || ""}
                          onChange={(e) => setMatrimonyPreferences({ ...matrimonyPreferences, min_height_cm: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Height (cm)</Label>
                        <Input
                          type="number"
                          value={matrimonyPreferences.max_height_cm || ""}
                          onChange={(e) => setMatrimonyPreferences({ ...matrimonyPreferences, max_height_cm: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

