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
import { Camera, X, Save, ArrowLeft, Plus, Trash2, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import { StaticBackground } from "@/components/discovery/static-background"
import { useToast } from "@/hooks/use-toast"
import type { DatingProfileFull } from "@/lib/datingProfileService"
import type { MatrimonyProfileFull } from "@/lib/matrimonyService"
import { saveDatingPreferences, uploadProfilePhoto, uploadProfileVideo } from "@/lib/datingProfileService"
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
  Art: ["Painting", "Photography", "Digital Art", "Sculpture", "Sketching"],
  Food: ["Foodie", "Cooking", "Trying new restaurants", "Baking", "Food photography"],
  Entertainment: ["Netflix nights", "YouTube rabbit holes", "Podcasts", "Reels & TikTok", "Live shows"],
  Lifestyle: ["Thrifting", "DIY Projects", "Volunteering", "Wellness", "Homebody"],
  "Weekend mood": ["Chill & recharge", "Spontaneous plans", "Friends & fun", "Solo reset", "Mix of everything"],
  "Dating vibes": ["Quality time", "Deep conversations", "Casual coffee dates", "Slow burn", "Romantic dates"],
  "Dating energy": ["Golden retriever energy", "Calm & grounded", "Introvert at first", "Extrovert energy", "Depends on the vibe"],
  "Travel style": ["Road trips", "Beach person", "Mountains > beaches", "City explorer", "Staycations"],
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
  const videoInputRef = useRef<HTMLInputElement>(null)
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
  const [datingVideo, setDatingVideo] = useState<File | null>(null)
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null)

  // Matrimony profile state
  const [matrimonyPhotos, setMatrimonyPhotos] = useState<Array<{ url: string; file?: File }>>([])
  const [matrimonyBio, setMatrimonyBio] = useState("")
  const [matrimonyPersonal, setMatrimonyPersonal] = useState<any>({})
  const [matrimonyCareer, setMatrimonyCareer] = useState<any>({})
  const [matrimonyFamily, setMatrimonyFamily] = useState<any>({})
  const [matrimonyCultural, setMatrimonyCultural] = useState<any>({})
  const [matrimonyPreferences, setMatrimonyPreferences] = useState<any>({})
  const [matrimonyHeightUnit, setMatrimonyHeightUnit] = useState<"cm" | "ftin">("cm")

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
          setExistingVideoUrl(data.video_url || null)
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
          setMatrimonyHeightUnit((data.personal as any)?.heightUnit || "cm")
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

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setDatingVideo(file)
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

        // Upload video if a new one is selected
        let videoUrl = existingVideoUrl
        let videoFileName = existing?.video_file_name
        if (datingVideo) {
          const videoResult = await uploadProfileVideo(user.id, datingVideo)
          if (videoResult.success && videoResult.data) {
            videoUrl = videoResult.data
            videoFileName = datingVideo.name
          } else {
            console.error("Failed to upload video:", videoResult.error)
            toast({
              title: "Warning",
              description: "Failed to upload video. Your profile was saved without the video.",
              variant: "destructive"
            })
          }
        }

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
          updateData.video_url = videoUrl
          updateData.video_file_name = videoFileName
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
          personal: { ...matrimonyPersonal, heightUnit: matrimonyHeightUnit },
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

  const isMatrimony = mode === 'matrimony'

  if (loading) {
    return (
      <div className={cn("flex flex-col h-full relative min-h-screen", isMatrimony ? "bg-white" : "bg-[#0E0F12]")}>
        {!isMatrimony && <StaticBackground />}
        <div className="flex items-center justify-center h-screen">
          <p className={isMatrimony ? "text-black" : "text-[#A1A1AA]"}>Loading...</p>
        </div>
      </div>
    )
  }

  const currentPhotos = userPath === 'dating' ? datingPhotos : matrimonyPhotos

  return (
    <div className={cn("flex flex-col h-full relative min-h-screen", isMatrimony ? "bg-white" : "bg-[#0E0F12]")}>
      {!isMatrimony && <StaticBackground />}
      <style dangerouslySetInnerHTML={{__html: `
        button[class*="bg-white/10"][class*="border-white/20"] {
          color: #FFFFFF !important;
        }
        button[class*="bg-white/10"][class*="border-white/20"] * {
          color: #FFFFFF !important;
        }
        span[data-slot="badge"][class*="bg-white/10"] {
          color: #FFFFFF !important;
        }
        span[data-slot="badge"][class*="bg-white/10"] * {
          color: #FFFFFF !important;
        }
      `}} />
      <div className={cn(
        "flex-shrink-0 p-4 border-b shadow-lg",
        isMatrimony ? "border-[#E5E5E5] bg-white" : "border-white/20 bg-[#14161B]/50 backdrop-blur-xl"
      )}>
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "p-2 rounded-full border",
              isMatrimony 
                ? "hover:bg-gray-50 bg-white border-[#E5E5E5]"
                : "hover:bg-white/10 bg-white/10 border-white/20 backdrop-blur-xl"
            )}
            onClick={onBack}
          >
            <ArrowLeft className={cn("w-5 h-5", isMatrimony ? "text-black" : "text-white")} />
          </Button>
          <h1 className={cn("text-2xl font-bold", isMatrimony ? "text-black" : "text-white")}>Edit Profile</h1>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-[#97011A] hover:bg-[#7A0115]"
            onClick={handleSave} 
            disabled={saving}
            style={{ color: '#FFFFFF' }}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("photos")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1",
                activeTab === "photos"
                  ? "bg-[#97011A] text-white"
                  : isMatrimony
                    ? "bg-white border border-[#E5E5E5] text-[#666666] hover:bg-gray-50"
                    : "bg-white/10 hover:bg-white/20"
              )}
              style={!isMatrimony && activeTab !== "photos" ? { color: '#A1A1AA' } : undefined}
            >
              Edit Photos
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1",
                activeTab === "about"
                  ? "bg-[#97011A] text-white"
                  : isMatrimony
                    ? "bg-white border border-[#E5E5E5] text-[#666666] hover:bg-gray-50"
                    : "bg-white/10 hover:bg-white/20"
              )}
              style={!isMatrimony && activeTab !== "about" ? { color: '#A1A1AA' } : undefined}
            >
              Edit About Myself
            </button>
          </div>

          <TabsContent value="photos" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className={cn("text-lg font-semibold mb-1", isMatrimony ? "text-black" : "text-white")}>Your Photos</h2>
                <p className={cn("text-sm", isMatrimony ? "text-[#666666]" : "text-[#A1A1AA]")}>
                  Add up to 6 photos to showcase yourself ({currentPhotos.length}/6)
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2",
                      isMatrimony 
                        ? "border-[#E5E5E5] bg-white" 
                        : "border-white/20 bg-[#14161B]"
                    )}>
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className={cn(
                        "absolute inset-0 transition-colors",
                        isMatrimony ? "bg-black/0 group-hover:bg-black/10" : "bg-black/0 group-hover:bg-black/20"
                      )} />
                      <Button
                        size="sm"
                        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg bg-[#97011A] hover:bg-[#7A0115]"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                      </Button>
                      <div className={cn(
                        "absolute bottom-1.5 left-1.5 text-xs px-2 py-0.5 rounded-full",
                        isMatrimony ? "bg-black/60 text-white" : "bg-black/60 text-white"
                      )}>
                        {index + 1}
                      </div>
                    </div>
                    {userPath === 'dating' && (
                      <Input
                        placeholder={photoPrompts[index] || "Caption (optional)"}
                        value={photo.caption || ""}
                        onChange={(e) => updatePhotoCaption(index, e.target.value)}
                        className={cn(
                          "text-xs mt-2",
                          isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"
                        )}
                        style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                      />
                    )}
                  </div>
                ))}
                
                {currentPhotos.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 group",
                      isMatrimony
                        ? "border-[#E5E5E5] bg-white hover:bg-gray-50"
                        : "border-white/20 bg-[#14161B] hover:bg-white/5"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#97011A]/20 flex items-center justify-center group-hover:bg-[#97011A]/30 transition-colors">
                      <Plus className="w-5 h-5" style={{ color: '#97011A' }} />
                    </div>
                    <span className={cn("text-xs font-medium", isMatrimony ? "text-[#666666]" : "text-[#A1A1AA]")}>Add Photo</span>
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

              {/* Video Section - Only for dating profile */}
              {userPath === 'dating' && (
                <div className="space-y-4 mt-6 pt-6 border-t border-white/20">
                  <div>
                    <h2 className="text-base font-semibold mb-1 sm:text-lg" style={{ color: '#FFFFFF' }}>Profile Video</h2>
                    <p className="text-xs sm:text-sm" style={{ color: '#A1A1AA' }}>
                      Add a 15-second video to bring your profile to life (optional)
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {existingVideoUrl && !datingVideo && (
                      <div className="relative">
                        <div className="aspect-video bg-[#14161B] rounded-xl overflow-hidden border-2 border-white/20 max-h-48 sm:max-h-56 md:max-h-64 lg:max-h-72">
                          <video
                            src={existingVideoUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-xs sm:text-sm" style={{ color: '#A1A1AA' }}>Current video</p>
                          <Button
                            size="sm"
                            className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 bg-white/10 border-white/20 hover:bg-white/20"
                            onClick={() => videoInputRef.current?.click()}
                            style={{ color: '#FFFFFF' }}
                          >
                            <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Replace Video
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {datingVideo && (
                      <div className="relative">
                        <div className="aspect-video bg-[#14161B] rounded-xl overflow-hidden border-2 border-white/20 max-h-48 sm:max-h-56 md:max-h-64 lg:max-h-72">
                          <video
                            src={URL.createObjectURL(datingVideo)}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-xs truncate sm:text-sm" style={{ color: '#A1A1AA' }}>{datingVideo.name}</p>
                          <Button
                            size="sm"
                            className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#97011A] hover:bg-[#7A0115]"
                            onClick={() => setDatingVideo(null)}
                            style={{ color: '#FFFFFF' }}
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {!existingVideoUrl && !datingVideo && (
                      <button
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full aspect-video bg-[#14161B] rounded-xl border-2 border-dashed border-white/20 hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-2 sm:gap-3 group max-h-48 sm:max-h-56 md:max-h-64 lg:max-h-72"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#97011A]/20 flex items-center justify-center group-hover:bg-[#97011A]/30 transition-colors">
                          <Video className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#97011A' }} />
                        </div>
                        <span className="text-xs sm:text-sm font-medium" style={{ color: '#A1A1AA' }}>Add Video</span>
                        <span className="text-xs" style={{ color: '#A1A1AA' }}>MP4, MOV (Max 15 seconds)</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            {userPath === 'dating' ? (
              <>
                {/* Bio */}
                <Card className="bg-[#14161B]/50 border border-white/20">
                  <CardHeader>
                    <CardTitle style={{ color: '#FFFFFF' }}>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      value={datingBio}
                      onChange={(e) => setDatingBio(e.target.value)}
                      rows={4}
                      className="bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"
                      style={{ color: '#FFFFFF' }}
                    />
                  </CardContent>
                </Card>

                {/* Prompts */}
                <Card className="bg-[#14161B]/50 border border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle style={{ color: '#FFFFFF' }}>Prompts</CardTitle>
                      <Button 
                        size="sm" 
                        className="bg-white/10 border-white/20 hover:bg-white/20"
                        onClick={addPrompt}
                        style={{ color: '#FFFFFF' }}
                      >
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
                        <div key={index} className="space-y-2 p-4 border border-white/20 rounded-lg bg-[#14161B]/30">
                          <div className="flex items-center justify-between">
                            <Label style={{ color: '#FFFFFF' }}>Prompt {index + 1}</Label>
                            <Button
                              size="sm"
                              className="bg-white/10 border-white/20 hover:bg-white/20"
                              onClick={() => removePrompt(index)}
                              style={{ color: '#FFFFFF' }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs" style={{ color: '#A1A1AA' }}>Prompt Question:</Label>
                            {prompt.prompt ? (
                              // Display selected prompt as read-only text
                              <div className="p-2.5 bg-[#14161B] rounded-md text-sm font-medium border border-white/20" style={{ color: '#FFFFFF' }}>
                                {prompt.prompt}
                              </div>
                            ) : (
                              // Show dropdown only when no prompt is selected
                              <Select
                                value=""
                                onValueChange={(value) => updatePrompt(index, 'prompt', value)}
                              >
                                <SelectTrigger className="bg-[#14161B] border-white/20 text-white">
                                  <SelectValue placeholder="Select a prompt..." style={{ color: '#A1A1AA' }} />
                                </SelectTrigger>
                                <SelectContent className="bg-[#14161B] border-white/20">
                                  {availablePrompts.map((p) => (
                                    <SelectItem key={p} value={p} className="text-white hover:bg-white/10 focus:bg-white/10">
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
                              className="bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"
                              style={{ color: '#FFFFFF' }}
                            />
                          )}
                        </div>
                      )
                    })}
                    {datingPromptsData.length === 0 && (
                      <p className="text-sm text-center py-4" style={{ color: '#A1A1AA' }}>
                        No prompts yet. Click "Add Prompt" to add one.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Interests */}
                <Card className="bg-[#14161B]/50 border border-white/20">
                  <CardHeader>
                    <CardTitle style={{ color: '#FFFFFF' }}>Interests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(interestCategories).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <Label className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{category}</Label>
                        <div className="flex flex-wrap gap-2">
                          {items.map((interest) => (
                            <Badge
                              key={interest}
                              className={cn(
                                "cursor-pointer",
                                datingInterests.includes(interest)
                                  ? "bg-[#97011A] text-white"
                                  : "bg-white/10 border-white/20 !text-white"
                              )}
                              onClick={() => toggleInterest(interest)}
                              style={{ color: '#FFFFFF !important' } as React.CSSProperties & { color: string }}
                            >
                              <span style={{ color: '#FFFFFF' }}>{interest}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* This or That */}
                <Card className="bg-[#14161B]/50 border border-white/20">
                  <CardHeader>
                    <CardTitle style={{ color: '#FFFFFF' }}>This or That</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {thisOrThatPairs.map(([optionA, optionB], index) => {
                      const selected = datingThisOrThat[index]
                      return (
                        <div key={index} className="grid grid-cols-2 gap-3">
                          <Button
                            className={cn(
                              "h-auto p-4 text-left border-2",
                              selected === 0
                                ? "bg-[#97011A] hover:bg-[#7A0115] border-[#97011A] !text-white"
                                : "bg-white/10 border-white/20 hover:bg-white/20 !text-white"
                            )}
                            onClick={() => toggleThisOrThat(index, 0)}
                            style={{ color: '#FFFFFF !important' } as React.CSSProperties & { color: string }}
                          >
                            <span style={{ color: '#FFFFFF' }}>{optionA}</span>
                          </Button>
                          <Button
                            className={cn(
                              "h-auto p-4 text-left border-2",
                              selected === 1
                                ? "bg-[#97011A] hover:bg-[#7A0115] border-[#97011A] !text-white"
                                : "bg-white/10 border-white/20 hover:bg-white/20 !text-white"
                            )}
                            onClick={() => toggleThisOrThat(index, 1)}
                            style={{ color: '#FFFFFF !important' } as React.CSSProperties & { color: string }}
                          >
                            <span style={{ color: '#FFFFFF' }}>{optionB}</span>
                          </Button>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Relationship Goals */}
                <Card className="bg-[#14161B]/50 border border-white/20">
                  <CardHeader>
                    <CardTitle style={{ color: '#FFFFFF' }}>Relationship Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {intentions.map((intention) => (
                        <Button
                          key={intention}
                          variant="ghost"
                          className={cn(
                            "justify-start h-auto p-4 border-2",
                            datingRelationshipGoal === intention
                              ? "bg-[#97011A] hover:bg-[#7A0115] border-[#97011A] !text-white"
                              : "bg-white/10 border-white/20 hover:bg-white/20 !text-white"
                          )}
                          onClick={() => setDatingRelationshipGoal(intention)}
                          style={{ color: '#FFFFFF !important' } as React.CSSProperties & { color: string }}
                        >
                          <span style={{ color: '#FFFFFF' }}>{intention}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card className="bg-[#14161B]/50 border border-white/20">
                  <CardHeader>
                    <CardTitle style={{ color: '#FFFFFF' }}>Dating Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label style={{ color: '#FFFFFF' }}>Looking for</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="ghost"
                          className={cn(
                            "border-2",
                            datingLookingFor === 'men'
                              ? "bg-[#97011A] hover:bg-[#7A0115] border-[#97011A] !text-white"
                              : "bg-white/10 border-white/20 hover:bg-white/20 !text-white"
                          )}
                          onClick={() => setDatingLookingFor('men')}
                          style={{ color: '#FFFFFF !important' } as React.CSSProperties & { color: string }}
                        >
                          <span style={{ color: '#FFFFFF' }}>Men</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className={cn(
                            "border-2",
                            datingLookingFor === 'women'
                              ? "bg-[#97011A] hover:bg-[#7A0115] border-[#97011A] !text-white"
                              : "bg-white/10 border-white/20 hover:bg-white/20 !text-white"
                          )}
                          onClick={() => setDatingLookingFor('women')}
                          style={{ color: '#FFFFFF !important' } as React.CSSProperties & { color: string }}
                        >
                          <span style={{ color: '#FFFFFF' }}>Women</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className={cn(
                            "border-2",
                            datingLookingFor === 'everyone'
                              ? "bg-[#97011A] hover:bg-[#7A0115] border-[#97011A] !text-white"
                              : "bg-white/10 border-white/20 hover:bg-white/20 !text-white"
                          )}
                          onClick={() => setDatingLookingFor('everyone')}
                          style={{ color: '#FFFFFF !important' } as React.CSSProperties & { color: string }}
                        >
                          <span style={{ color: '#FFFFFF' }}>Everyone</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label style={{ color: '#FFFFFF' }}>Show on profile</Label>
                      <Button
                        variant="ghost"
                        className={cn(
                          "border-2",
                          datingShowOnProfile
                            ? "bg-[#97011A] hover:bg-[#7A0115] border-[#97011A] !text-white"
                            : "bg-white/10 border-white/20 hover:bg-white/20 !text-white"
                        )}
                        onClick={() => setDatingShowOnProfile(!datingShowOnProfile)}
                        style={{ color: '#FFFFFF !important' } as React.CSSProperties & { color: string }}
                      >
                        <span style={{ color: '#FFFFFF' }}>{datingShowOnProfile ? "Yes" : "No"}</span>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label style={{ color: '#FFFFFF' }}>Age range: {datingAgeRange[0]} - {datingAgeRange[1]} years</Label>
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
                        className="[&_[role=slider]]:bg-[#97011A]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label style={{ color: '#FFFFFF' }}>Maximum distance: {datingDistance[0]} km</Label>
                      <Slider
                        value={datingDistance}
                        onValueChange={setDatingDistance}
                        max={100}
                        min={5}
                        step={5}
                        className="[&_[role=slider]]:bg-[#97011A]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Bio */}
                <Card className={cn(isMatrimony ? "bg-white border-[#E5E5E5]" : "bg-[#14161B]/50 border border-white/20")}>
                  <CardHeader>
                    <CardTitle className={cn(isMatrimony ? "text-black" : "text-white")}>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      value={matrimonyBio}
                      onChange={(e) => setMatrimonyBio(e.target.value)}
                      rows={4}
                      className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                      style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                    />
                  </CardContent>
                </Card>

                {/* Personal Details */}
                <Card className={cn(isMatrimony ? "bg-white border-[#E5E5E5]" : "bg-[#14161B]/50 border border-white/20")}>
                  <CardHeader>
                    <CardTitle className={cn(isMatrimony ? "text-black" : "text-white")}>Personal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Height unit</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={matrimonyHeightUnit === "cm" ? "default" : "outline"}
                            onClick={() => setMatrimonyHeightUnit("cm")}
                            className={matrimonyHeightUnit === "cm" ? "bg-[#97011A] hover:bg-[#7A010E] text-white" : ""}
                            size="sm"
                          >
                            cm
                          </Button>
                          <Button
                            type="button"
                            variant={matrimonyHeightUnit === "ftin" ? "default" : "outline"}
                            onClick={() => setMatrimonyHeightUnit("ftin")}
                            className={matrimonyHeightUnit === "ftin" ? "bg-[#97011A] hover:bg-[#7A010E] text-white" : ""}
                            size="sm"
                          >
                            ft/in
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Height</Label>
                        {matrimonyHeightUnit === "cm" ? (
                          <Input
                            type="number"
                            min={90}
                            max={250}
                            value={matrimonyPersonal.height_cm || ""}
                            onChange={(e) => setMatrimonyPersonal({ ...matrimonyPersonal, height_cm: parseInt(e.target.value) || 0 })}
                            className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                            style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                          />
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="ft"
                              value={matrimonyPersonal.height_ft || ""}
                              onChange={(e) => {
                                const ft = parseInt(e.target.value) || 0
                                const inch = matrimonyPersonal.height_inch || 0
                                const cm = Math.round((ft * 12 + inch) * 2.54)
                                setMatrimonyPersonal({ ...matrimonyPersonal, height_ft: ft, height_cm: cm })
                              }}
                              className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                              style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                            />
                            <Input
                              type="number"
                              placeholder="in"
                              value={matrimonyPersonal.height_inch || ""}
                              onChange={(e) => {
                                const inch = parseInt(e.target.value) || 0
                                const ft = matrimonyPersonal.height_ft || 0
                                const cm = Math.round((ft * 12 + inch) * 2.54)
                                setMatrimonyPersonal({ ...matrimonyPersonal, height_inch: inch, height_cm: cm })
                              }}
                              className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                              style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Complexion / Skin tone</Label>
                        <Select
                          value={matrimonyPersonal.complexion || ""}
                          onValueChange={(value) => setMatrimonyPersonal({ ...matrimonyPersonal, complexion: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select complexion" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Fair", "Wheatish", "Dusky", "Dark"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Body Type</Label>
                        <Select
                          value={matrimonyPersonal.body_type || ""}
                          onValueChange={(value) => setMatrimonyPersonal({ ...matrimonyPersonal, body_type: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select body type" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Slim", "Athletic", "Average", "Plus-size"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Dietary Habits</Label>
                        <Select
                          value={matrimonyPersonal.diet || ""}
                          onValueChange={(value) => setMatrimonyPersonal({ ...matrimonyPersonal, diet: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select dietary preference" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Vegetarian", "Eggetarian", "Non-vegetarian", "Pescatarian", "Vegan", "Jain", "Other"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Marital Status</Label>
                        <Select
                          value={matrimonyPersonal.marital_status || ""}
                          onValueChange={(value) => setMatrimonyPersonal({ ...matrimonyPersonal, marital_status: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Never Married", "Divorced", "Widowed", "Annulled", "Separated"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Smoker</Label>
                        <Button
                          type="button"
                          variant={matrimonyPersonal.smoker ? "default" : "outline"}
                          onClick={() => setMatrimonyPersonal({ ...matrimonyPersonal, smoker: !matrimonyPersonal.smoker })}
                          className={matrimonyPersonal.smoker ? "bg-[#97011A] hover:bg-[#7A010E] text-white" : ""}
                          size="sm"
                        >
                          {matrimonyPersonal.smoker ? "Yes" : "No"}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Drinker</Label>
                        <Button
                          type="button"
                          variant={matrimonyPersonal.drinker ? "default" : "outline"}
                          onClick={() => setMatrimonyPersonal({ ...matrimonyPersonal, drinker: !matrimonyPersonal.drinker })}
                          className={matrimonyPersonal.drinker ? "bg-[#97011A] hover:bg-[#7A010E] text-white" : ""}
                          size="sm"
                        >
                          {matrimonyPersonal.drinker ? "Yes" : "No"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Career */}
                <Card className={cn(isMatrimony ? "bg-white border-[#E5E5E5]" : "bg-[#14161B]/50 border border-white/20")}>
                  <CardHeader>
                    <CardTitle className={cn(isMatrimony ? "text-black" : "text-white")}>Career & Education</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Highest Education</Label>
                        <Select
                          value={matrimonyCareer.highest_education || ""}
                          onValueChange={(value) => setMatrimonyCareer({ ...matrimonyCareer, highest_education: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select highest education" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["High School", "Diploma", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "MBA", "PhD", "MD", "JD", "Other"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>College / University</Label>
                        <Input
                          placeholder="e.g., Stanford University"
                          value={matrimonyCareer.college || ""}
                          onChange={(e) => setMatrimonyCareer({ ...matrimonyCareer, college: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Current Profession / Job Title</Label>
                        <Select
                          value={matrimonyCareer.job_title || ""}
                          onValueChange={(value) => setMatrimonyCareer({ ...matrimonyCareer, job_title: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select job title" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Software Engineer", "Data Scientist", "Product Manager", "Business Analyst", "Consultant", "Doctor", "Engineer", "Teacher", "Professor", "Lawyer", "Accountant", "Architect", "Designer", "Marketing Manager", "Sales Manager", "HR Manager", "Operations Manager", "Financial Analyst", "Investment Banker", "Entrepreneur", "Business Owner", "Nurse", "Pharmacist", "Dentist", "Veterinarian", "Scientist", "Researcher", "Journalist", "Writer", "Artist", "Musician", "Chef", "Pilot", "Civil Servant", "Government Employee", "Student", "Unemployed", "Retired", "Other"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Company Name</Label>
                        <Input
                          placeholder="e.g., Google"
                          value={matrimonyCareer.company || ""}
                          onChange={(e) => setMatrimonyCareer({ ...matrimonyCareer, company: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Annual Income</Label>
                        <Input
                          placeholder="e.g., 10–15 LPA / Prefer not to say"
                          value={matrimonyCareer.annual_income || ""}
                          onChange={(e) => setMatrimonyCareer({ ...matrimonyCareer, annual_income: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Work Location - City</Label>
                        <Input
                          placeholder="City"
                          value={matrimonyCareer.work_location?.city || ""}
                          onChange={(e) => setMatrimonyCareer({ 
                            ...matrimonyCareer, 
                            work_location: { 
                              ...matrimonyCareer.work_location, 
                              city: e.target.value 
                            } 
                          })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Work Location - State</Label>
                        <Input
                          placeholder="State"
                          value={matrimonyCareer.work_location?.state || ""}
                          onChange={(e) => setMatrimonyCareer({ 
                            ...matrimonyCareer, 
                            work_location: { 
                              ...matrimonyCareer.work_location, 
                              state: e.target.value 
                            } 
                          })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Work Location - Country</Label>
                        <Input
                          placeholder="Country"
                          value={matrimonyCareer.work_location?.country || ""}
                          onChange={(e) => setMatrimonyCareer({ 
                            ...matrimonyCareer, 
                            work_location: { 
                              ...matrimonyCareer.work_location, 
                              country: e.target.value 
                            } 
                          })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Family */}
                <Card className={cn(isMatrimony ? "bg-white border-[#E5E5E5]" : "bg-[#14161B]/50 border border-white/20")}>
                  <CardHeader>
                    <CardTitle className={cn(isMatrimony ? "text-black" : "text-white")}>Family Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Family Type</Label>
                        <Select
                          value={matrimonyFamily.family_type || ""}
                          onValueChange={(value) => setMatrimonyFamily({ ...matrimonyFamily, family_type: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select family type" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Joint", "Nuclear", "Extended", "Single Parent"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Family Values</Label>
                        <Select
                          value={matrimonyFamily.family_values || ""}
                          onValueChange={(value) => setMatrimonyFamily({ ...matrimonyFamily, family_values: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select values" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Traditional", "Moderate", "Modern", "Progressive"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Father's Occupation</Label>
                        <Select
                          value={matrimonyFamily.father_occupation || ""}
                          onValueChange={(value) => setMatrimonyFamily({ ...matrimonyFamily, father_occupation: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select occupation" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Software Engineer", "Data Scientist", "Product Manager", "Business Analyst", "Consultant", "Doctor", "Engineer", "Teacher", "Professor", "Lawyer", "Accountant", "Architect", "Designer", "Marketing Manager", "Sales Manager", "HR Manager", "Operations Manager", "Financial Analyst", "Investment Banker", "Entrepreneur", "Business Owner", "Nurse", "Pharmacist", "Dentist", "Veterinarian", "Scientist", "Researcher", "Journalist", "Writer", "Artist", "Musician", "Chef", "Pilot", "Civil Servant", "Government Employee", "Student", "Unemployed", "Retired", "Homemaker", "Other"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Father's Company</Label>
                        <Input
                          value={matrimonyFamily.father_company || ""}
                          onChange={(e) => setMatrimonyFamily({ ...matrimonyFamily, father_company: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Mother's Occupation</Label>
                        <Select
                          value={matrimonyFamily.mother_occupation || ""}
                          onValueChange={(value) => setMatrimonyFamily({ ...matrimonyFamily, mother_occupation: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select occupation" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Software Engineer", "Data Scientist", "Product Manager", "Business Analyst", "Consultant", "Doctor", "Engineer", "Teacher", "Professor", "Lawyer", "Accountant", "Architect", "Designer", "Marketing Manager", "Sales Manager", "HR Manager", "Operations Manager", "Financial Analyst", "Investment Banker", "Entrepreneur", "Business Owner", "Nurse", "Pharmacist", "Dentist", "Veterinarian", "Scientist", "Researcher", "Journalist", "Writer", "Artist", "Musician", "Chef", "Pilot", "Civil Servant", "Government Employee", "Student", "Unemployed", "Retired", "Homemaker", "Other"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Mother's Company</Label>
                        <Input
                          value={matrimonyFamily.mother_company || ""}
                          onChange={(e) => setMatrimonyFamily({ ...matrimonyFamily, mother_company: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Brothers</Label>
                        <Input
                          type="number"
                          min={0}
                          value={matrimonyFamily.brothers || ""}
                          onChange={(e) => setMatrimonyFamily({ ...matrimonyFamily, brothers: parseInt(e.target.value) || 0 })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Sisters</Label>
                        <Input
                          type="number"
                          min={0}
                          value={matrimonyFamily.sisters || ""}
                          onChange={(e) => setMatrimonyFamily({ ...matrimonyFamily, sisters: parseInt(e.target.value) || 0 })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Marital Status of Siblings</Label>
                        <Select
                          value={matrimonyFamily.siblings_married || ""}
                          onValueChange={(value) => setMatrimonyFamily({ ...matrimonyFamily, siblings_married: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["None", "Some", "All", "Mostly Married", "Mostly Single"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Show family information on profile</Label>
                      <Button
                        type="button"
                        variant={matrimonyFamily.show_on_profile ? "default" : "outline"}
                        onClick={() => setMatrimonyFamily({ ...matrimonyFamily, show_on_profile: !matrimonyFamily.show_on_profile })}
                        className={matrimonyFamily.show_on_profile ? "bg-[#97011A] hover:bg-[#7A010E] text-white" : ""}
                        size="sm"
                      >
                        {matrimonyFamily.show_on_profile ? "Yes" : "No"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Cultural */}
                <Card className={cn(isMatrimony ? "bg-white border-[#E5E5E5]" : "bg-[#14161B]/50 border border-white/20")}>
                  <CardHeader>
                    <CardTitle className={cn(isMatrimony ? "text-black" : "text-white")}>Cultural Background</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Religion</Label>
                        <Select
                          value={matrimonyCultural.religion || ""}
                          onValueChange={(value) => setMatrimonyCultural({ ...matrimonyCultural, religion: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select religion" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Judaism", "Zoroastrianism", "Bahá'í", "Atheist", "Agnostic", "Spiritual", "Other"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Mother Tongue</Label>
                        <Select
                          value={matrimonyCultural.mother_tongue || ""}
                          onValueChange={(value) => setMatrimonyCultural({ ...matrimonyCultural, mother_tongue: value })}
                        >
                          <SelectTrigger className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            <SelectValue placeholder="Select mother tongue" />
                          </SelectTrigger>
                          <SelectContent className={isMatrimony ? "" : "bg-[#14161B] border-white/20"}>
                            {["Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Sanskrit", "Kashmiri", "Sindhi", "Konkani", "Manipuri", "Nepali", "Bodo", "Santhali", "Maithili", "Dogri", "Other"].map((option) => (
                              <SelectItem key={option} value={option} className={isMatrimony ? "" : "text-white"}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Community / Caste</Label>
                        <Input
                          value={matrimonyCultural.community || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, community: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Sub-caste (optional)</Label>
                        <Input
                          value={matrimonyCultural.sub_caste || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, sub_caste: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Date of Birth</Label>
                        <Input
                          type="date"
                          value={matrimonyCultural.dob || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, dob: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Time of Birth</Label>
                        <Input
                          type="time"
                          value={matrimonyCultural.tob || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, tob: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Place of Birth</Label>
                        <Input
                          placeholder="City, Country"
                          value={matrimonyCultural.pob || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, pob: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Star / Raashi (optional)</Label>
                        <Input
                          value={matrimonyCultural.star || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, star: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Gotra (optional)</Label>
                        <Input
                          value={matrimonyCultural.gotra || ""}
                          onChange={(e) => setMatrimonyCultural({ ...matrimonyCultural, gotra: e.target.value })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Partner Preferences */}
                <Card className={cn(isMatrimony ? "bg-white border-[#E5E5E5]" : "bg-[#14161B]/50 border border-white/20")}>
                  <CardHeader>
                    <CardTitle className={cn(isMatrimony ? "text-black" : "text-white")}>Partner Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Min Age</Label>
                        <Input
                          type="number"
                          value={matrimonyPreferences.min_age || ""}
                          onChange={(e) => setMatrimonyPreferences({ ...matrimonyPreferences, min_age: parseInt(e.target.value) || 0 })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Max Age</Label>
                        <Input
                          type="number"
                          value={matrimonyPreferences.max_age || ""}
                          onChange={(e) => setMatrimonyPreferences({ ...matrimonyPreferences, max_age: parseInt(e.target.value) || 0 })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Min Height (cm)</Label>
                        <Input
                          type="number"
                          value={matrimonyPreferences.min_height_cm || ""}
                          onChange={(e) => setMatrimonyPreferences({ ...matrimonyPreferences, min_height_cm: parseInt(e.target.value) || 0 })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={cn(isMatrimony ? "text-black" : "text-white")}>Max Height (cm)</Label>
                        <Input
                          type="number"
                          value={matrimonyPreferences.max_height_cm || ""}
                          onChange={(e) => setMatrimonyPreferences({ ...matrimonyPreferences, max_height_cm: parseInt(e.target.value) || 0 })}
                          className={isMatrimony ? "" : "bg-[#14161B] border-white/20 placeholder:text-[#A1A1AA]"}
                          style={!isMatrimony ? { color: '#FFFFFF' } : undefined}
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

