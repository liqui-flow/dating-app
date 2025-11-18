"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Briefcase, GraduationCap, Users, Edit, Share, MoreVertical, Heart, Video, Home, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { StaticBackground } from "@/components/discovery/static-background"
import { supabase } from "@/lib/supabaseClient"
import type { DatingProfileFull } from "@/lib/datingProfileService"
import type { MatrimonyProfileFull } from "@/lib/matrimonyService"
import { EditProfile } from "./edit-profile"

interface ProfileViewProps {
  isOwnProfile?: boolean
  onEdit?: () => void
  userId?: string // Optional: if viewing another user's profile
  mode?: 'dating' | 'matrimony' // Required: determines which profile table to use
}

function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function ProfileView({ isOwnProfile = false, onEdit, userId, mode }: ProfileViewProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userPath, setUserPath] = useState<'dating' | 'matrimony' | null>(null)
  const [datingProfile, setDatingProfile] = useState<DatingProfileFull | null>(null)
  const [matrimonyProfile, setMatrimonyProfile] = useState<MatrimonyProfileFull | null>(null)
  const [verified, setVerified] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [userId, isOwnProfile])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleEditBack = () => {
    setIsEditing(false)
  }

  const handleEditSave = () => {
    fetchProfile() // Refresh profile data
    setIsEditing(false)
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const targetUserId = userId || user.id

      // Use mode prop to determine which profile to load, NOT selected_path
      // Mode is determined by the current context (which page/route we're on)
      const currentMode = mode || 'dating' // Default to dating for backward compatibility
      setUserPath(currentMode)

      // Check verification status
      const { data: verification } = await supabase
        .from('id_verifications')
        .select('status')
        .eq('user_id', targetUserId)
        .eq('status', 'approved')
        .maybeSingle()

      setVerified(!!verification)

      if (currentMode === 'dating') {
        // ALWAYS fetch from dating_profile_full when in dating mode
        const { data, error } = await supabase
          .from('dating_profile_full')
          .select('*')
          .eq('user_id', targetUserId)
          .single()

        if (!error && data) {
          setDatingProfile(data as DatingProfileFull)
        }
      } else if (currentMode === 'matrimony') {
        // ALWAYS fetch from matrimony_profile_full when in matrimony mode
        const { data, error } = await supabase
          .from('matrimony_profile_full')
          .select('*')
          .eq('user_id', targetUserId)
          .single()

        if (!error && data) {
          setMatrimonyProfile(data as MatrimonyProfileFull)
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (isEditing && isOwnProfile) {
    return <EditProfile mode={mode} onBack={handleEditBack} onSave={handleEditSave} />
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <StaticBackground />
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  const profile = userPath === 'dating' ? datingProfile : matrimonyProfile
  const name = profile?.name || "User"
  const photos = (userPath === 'dating' 
    ? (datingProfile?.photos as string[] || [])
    : (matrimonyProfile?.photos as string[] || [])) || []
  const photoPrompts = (userPath === 'dating' 
    ? (datingProfile?.photo_prompts as string[] || [])
    : []) || []
  const bio = userPath === 'dating' 
    ? datingProfile?.bio 
    : matrimonyProfile?.bio

  // Calculate age
  let age: number | null = null
  if (userPath === 'dating' && datingProfile?.dob) {
    age = calculateAge(datingProfile.dob)
  } else if (userPath === 'matrimony' && matrimonyProfile?.age) {
    age = matrimonyProfile.age
  }

  return (
    <div className="min-h-screen relative">
      <StaticBackground />
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">{isOwnProfile ? "My Profile" : name}</h1>
          <div className="flex items-center space-x-2">
            {isOwnProfile ? (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pb-20 space-y-6">
        {/* Photo Section */}
        {photos.length > 0 && (
          <Card className="overflow-hidden">
            <div className="relative">
              <img
                src={photos[currentPhotoIndex] || "/placeholder.svg"}
                alt={`${name} photo ${currentPhotoIndex + 1}`}
                className="w-full h-96 object-cover"
              />

              {/* Photo navigation dots */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentPhotoIndex ? "bg-white" : "bg-white/50",
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                {verified && <Badge className="bg-primary text-primary-foreground">Verified</Badge>}
              </div>
            </div>
            {/* Photo Prompt */}
            {userPath === 'dating' && photoPrompts[currentPhotoIndex] && photoPrompts[currentPhotoIndex].trim() && (
              <div className="p-4 pt-2">
                <p className="text-sm text-muted-foreground text-center">
                  {photoPrompts[currentPhotoIndex]}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {name}{age ? `, ${age}` : ''}
                </h2>
                {!isOwnProfile && (
                  <Button size="sm" className="rounded-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Dating-specific fields */}
            {userPath === 'dating' && datingProfile && (
              <>
                {datingProfile.gender && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Gender</p>
                    <p className="text-sm text-muted-foreground capitalize">{datingProfile.gender}</p>
                  </div>
                )}
                {datingProfile.relationship_goals && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Looking for</p>
                    <p className="text-sm text-muted-foreground">{datingProfile.relationship_goals}</p>
                  </div>
                )}
              </>
            )}

            {/* Matrimony-specific fields */}
            {userPath === 'matrimony' && matrimonyProfile && (
              <>
                {matrimonyProfile.gender && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Gender</p>
                    <p className="text-sm text-muted-foreground">{matrimonyProfile.gender}</p>
                  </div>
                )}
                {matrimonyProfile.personal?.height_cm && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Height</p>
                    <p className="text-sm text-muted-foreground">{matrimonyProfile.personal.height_cm} cm</p>
                  </div>
                )}
              </>
            )}

            {bio && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold">About Me</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dating Profile Sections */}
        {userPath === 'dating' && datingProfile && (
          <>
            {/* Interests */}
            {datingProfile.interests && (datingProfile.interests as string[]).length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {(datingProfile.interests as string[]).map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prompts */}
            {datingProfile.prompts && (datingProfile.prompts as Array<{ prompt: string; answer: string }>).length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Prompts</h3>
                  <div className="space-y-4">
                    {(datingProfile.prompts as Array<{ prompt: string; answer: string }>).map((prompt, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm font-medium">{prompt.prompt}</p>
                        <p className="text-sm text-muted-foreground">{prompt.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* This or That */}
            {datingProfile.this_or_that_choices && (datingProfile.this_or_that_choices as Array<{ option_a: string; option_b: string; selected: 0 | 1 }>).length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">This or That</h3>
                  <div className="space-y-3">
                    {(datingProfile.this_or_that_choices as Array<{ option_a: string; option_b: string; selected: 0 | 1 }>).map((choice, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Badge variant={choice.selected === 0 ? "default" : "outline"}>{choice.option_a}</Badge>
                        <span className="text-sm text-muted-foreground">or</span>
                        <Badge variant={choice.selected === 1 ? "default" : "outline"}>{choice.option_b}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video */}
            {datingProfile.video_url && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Video className="w-4 h-4" />
                    <span>Video</span>
                  </h3>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <video src={datingProfile.video_url} controls className="w-full h-full rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Matrimony Profile Sections */}
        {userPath === 'matrimony' && matrimonyProfile && (
          <>
            {/* Career & Education */}
            {matrimonyProfile.career && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Career & Education</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matrimonyProfile.career.highest_education && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Education</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.career.highest_education}</p>
                      </div>
                    )}
                    {matrimonyProfile.career.job_title && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Profession</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.career.job_title}</p>
                      </div>
                    )}
                    {matrimonyProfile.career.company && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Company</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.career.company}</p>
                      </div>
                    )}
                    {matrimonyProfile.career.work_location && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {[
                            matrimonyProfile.career.work_location.city,
                            matrimonyProfile.career.work_location.state,
                            matrimonyProfile.career.work_location.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Details */}
            {matrimonyProfile.personal && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matrimonyProfile.personal.diet && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Diet</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.personal.diet}</p>
                      </div>
                    )}
                    {matrimonyProfile.personal.smoker !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Smoking</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.personal.smoker ? "Yes" : "No"}</p>
                      </div>
                    )}
                    {matrimonyProfile.personal.drinker !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Drinking</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.personal.drinker ? "Yes" : "No"}</p>
                      </div>
                    )}
                    {matrimonyProfile.personal.complexion && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Complexion</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.personal.complexion}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Family Information */}
            {matrimonyProfile.family && matrimonyProfile.family.show_on_profile && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Home className="w-4 h-4" />
                    <span>Family Information</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matrimonyProfile.family.family_type && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Family Type</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.family.family_type}</p>
                      </div>
                    )}
                    {matrimonyProfile.family.family_values && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Family Values</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.family.family_values}</p>
                      </div>
                    )}
                    {matrimonyProfile.family.father_occupation && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Father's Occupation</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.family.father_occupation}</p>
                      </div>
                    )}
                    {matrimonyProfile.family.mother_occupation && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Mother's Occupation</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.family.mother_occupation}</p>
                      </div>
                    )}
                    {(matrimonyProfile.family.brothers !== undefined || matrimonyProfile.family.sisters !== undefined) && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Siblings</p>
                        <p className="text-sm text-muted-foreground">
                          {[
                            matrimonyProfile.family.brothers ? `${matrimonyProfile.family.brothers} brother(s)` : null,
                            matrimonyProfile.family.sisters ? `${matrimonyProfile.family.sisters} sister(s)` : null
                          ].filter(Boolean).join(', ') || 'None'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cultural Background */}
            {matrimonyProfile.cultural && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Cultural Background</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matrimonyProfile.cultural.religion && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Religion</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.cultural.religion}</p>
                      </div>
                    )}
                    {matrimonyProfile.cultural.mother_tongue && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Mother Tongue</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.cultural.mother_tongue}</p>
                      </div>
                    )}
                    {matrimonyProfile.cultural.community && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Community</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.cultural.community}</p>
                      </div>
                    )}
                    {matrimonyProfile.cultural.star_raashi && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Star/Raashi</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.cultural.star_raashi}</p>
                      </div>
                    )}
                    {matrimonyProfile.cultural.gotra && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Gotra</p>
                        <p className="text-sm text-muted-foreground">{matrimonyProfile.cultural.gotra}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!profile && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">No profile data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
