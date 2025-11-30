"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Briefcase, GraduationCap, Users, Edit, Share, MoreVertical, Heart, Video, Home, Building2, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { StaticBackground } from "@/components/discovery/static-background"
import { supabase } from "@/lib/supabaseClient"
import type { DatingProfileFull } from "@/lib/datingProfileService"
import type { MatrimonyProfileFull } from "@/lib/matrimonyService"
import { EditProfile } from "./edit-profile"
import { recordDatingLike, recordMatrimonyLike } from "@/lib/matchmakingService"

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
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const photoContainerRef = useRef<HTMLDivElement>(null)
  const [isMatched, setIsMatched] = useState(false)
  const [canLikeBack, setCanLikeBack] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [userId, isOwnProfile, mode])

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

      // Check match and like status only if viewing another user's profile
      if (!isOwnProfile && userId) {
        if (currentMode === 'dating') {
          // Check if there's a match - matches are stored with user1_id < user2_id
          const { data: allMatches } = await supabase
            .from('dating_matches')
            .select('id, user1_id, user2_id')
            .eq('is_active', true)

          const matchData = allMatches?.find(m => 
            (m.user1_id === user.id && m.user2_id === targetUserId) ||
            (m.user1_id === targetUserId && m.user2_id === user.id)
          )

          setIsMatched(!!matchData)

          // Check if the viewed user has liked the current user (but current user hasn't liked back)
          if (!matchData) {
            const { data: likeFromThem } = await supabase
              .from('dating_likes')
              .select('id')
              .eq('liker_id', targetUserId)
              .eq('liked_id', user.id)
              .in('action', ['like', 'super_like'])
              .maybeSingle()

            const { data: likeFromMe } = await supabase
              .from('dating_likes')
              .select('id')
              .eq('liker_id', user.id)
              .eq('liked_id', targetUserId)
              .in('action', ['like', 'super_like'])
              .maybeSingle()

            setCanLikeBack(!!likeFromThem && !likeFromMe)
          } else {
            setCanLikeBack(false)
          }
        } else if (currentMode === 'matrimony') {
          // Check if there's a match - matches are stored with user1_id < user2_id
          const { data: allMatches } = await supabase
            .from('matrimony_matches')
            .select('id, user1_id, user2_id')
            .eq('is_active', true)

          const matchData = allMatches?.find(m => 
            (m.user1_id === user.id && m.user2_id === targetUserId) ||
            (m.user1_id === targetUserId && m.user2_id === user.id)
          )

          setIsMatched(!!matchData)

          // Check if the viewed user has liked the current user (but current user hasn't liked back)
          if (!matchData) {
            const { data: likeFromThem } = await supabase
              .from('matrimony_likes')
              .select('id')
              .eq('liker_id', targetUserId)
              .eq('liked_id', user.id)
              .in('action', ['like', 'connect'])
              .maybeSingle()

            const { data: likeFromMe } = await supabase
              .from('matrimony_likes')
              .select('id')
              .eq('liker_id', user.id)
              .eq('liked_id', targetUserId)
              .in('action', ['like', 'connect'])
              .maybeSingle()

            setCanLikeBack(!!likeFromThem && !likeFromMe)
          } else {
            setCanLikeBack(false)
          }
        }
      } else {
        setIsMatched(false)
        setCanLikeBack(false)
      }

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

  const handleNextPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
    }
  }

  const handlePrevPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && photos.length > 0) {
      handleNextPhoto()
    }
    if (isRightSwipe && photos.length > 0) {
      handlePrevPhoto()
    }
  }

  const handleLike = async () => {
    if (!userId || isOwnProfile || isLiking) return

    try {
      setIsLiking(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const currentMode = mode || 'dating'
      const result = currentMode === 'dating'
        ? await recordDatingLike(user.id, userId, 'like')
        : await recordMatrimonyLike(user.id, userId, 'like')

      if (result.success) {
        // Refresh the profile to update match/like status
        await fetchProfile()
      }
    } catch (error) {
      console.error("Error liking profile:", error)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <StaticBackground />
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-b from-black/60 via-black/40 to-transparent border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white">{isOwnProfile ? "My Profile" : name}</h1>
          <div className="flex items-center space-x-2">
            {isOwnProfile ? (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Share className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-4">
        {/* Photo Section */}
        {photos.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden shadow-lg group">
            <div 
              ref={photoContainerRef}
              className="relative h-80 bg-gradient-to-br from-gray-900/50 to-gray-800/50"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={photos[currentPhotoIndex] || "/placeholder.svg"}
                alt={`${name} photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

              {/* Photo navigation arrows - minimal */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all z-10 opacity-0 group-hover:opacity-100"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all z-10 opacity-0 group-hover:opacity-100"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Minimal photo navigation dots */}
              {photos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={cn(
                        "transition-all duration-200 rounded-full",
                        index === currentPhotoIndex 
                          ? "w-6 h-1.5 bg-white/90" 
                          : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60",
                      )}
                      aria-label={`Go to photo ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Verified Badge - minimal */}
              {verified && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 flex items-center gap-1 px-2 py-0.5 text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </Badge>
                </div>
              )}

              {/* Photo counter - minimal */}
              {photos.length > 1 && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-black/30 backdrop-blur-md text-white/90 border-white/10 px-2 py-0.5 text-xs">
                    {currentPhotoIndex + 1}/{photos.length}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Photo Prompt - minimal */}
            {userPath === 'dating' && photoPrompts[currentPhotoIndex] && photoPrompts[currentPhotoIndex].trim() && (
              <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 p-3">
                <p className="text-xs text-white/80 text-center">
                  {photoPrompts[currentPhotoIndex]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Basic Info */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-3xl font-bold text-white">
                    {name}{age ? `, ${age}` : ''}
                  </h2>
                  {verified && (
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                
                {/* Quick Info Pills */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {userPath === 'dating' && datingProfile?.gender && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {datingProfile.gender}
                    </Badge>
                  )}
                  {userPath === 'dating' && datingProfile?.relationship_goals && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {datingProfile.relationship_goals}
                    </Badge>
                  )}
                  {userPath === 'matrimony' && matrimonyProfile?.gender && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {matrimonyProfile.gender}
                    </Badge>
                  )}
                  {userPath === 'matrimony' && matrimonyProfile?.personal?.height_cm && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {matrimonyProfile.personal.height_cm} cm
                    </Badge>
                  )}
                </div>
              </div>
              
              {!isOwnProfile && (
                <>
                  {isMatched ? (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg flex items-center gap-1.5 px-4 py-2 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Matched
                    </Badge>
                  ) : canLikeBack ? (
                    <Button 
                      size="lg" 
                      onClick={handleLike}
                      disabled={isLiking}
                      className="rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg border-0 px-6 h-12"
                    >
                      <Heart className="w-5 h-5 mr-2 fill-white" />
                      {isLiking ? "Liking..." : "Like Back"}
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={handleLike}
                      disabled={isLiking}
                      className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg border-0 px-6 h-12"
                    >
                      <Heart className="w-5 h-5 mr-2 fill-white" />
                      {isLiking ? "Liking..." : "Like"}
                    </Button>
                  )}
                </>
              )}
            </div>

            {bio && (
              <>
                <Separator className="bg-white/10" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    About Me
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">{bio}</p>
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
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-white text-lg mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {(datingProfile.interests as string[]).map((interest) => (
                      <Badge 
                        key={interest} 
                        className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border-white/30 hover:from-purple-500/40 hover:to-pink-500/40 transition-all px-3 py-1.5"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prompts */}
            {datingProfile.prompts && (datingProfile.prompts as Array<{ prompt: string; answer: string }>).length > 0 && (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-semibold text-white text-lg mb-4">Prompts</h3>
                  <div className="space-y-5">
                    {(datingProfile.prompts as Array<{ prompt: string; answer: string }>).map((prompt, index) => (
                      <div key={index} className="space-y-2 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                        <p className="text-sm font-semibold text-white/90">{prompt.prompt}</p>
                        <p className="text-sm text-white/70 leading-relaxed">{prompt.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* This or That */}
            {datingProfile.this_or_that_choices && (datingProfile.this_or_that_choices as Array<{ option_a: string; option_b: string; selected: 0 | 1 }>).length > 0 && (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-white text-lg mb-4">This or That</h3>
                  <div className="space-y-3">
                    {(datingProfile.this_or_that_choices as Array<{ option_a: string; option_b: string; selected: 0 | 1 }>).map((choice, index) => (
                      <div key={index} className="flex items-center justify-center gap-3">
                        <Badge 
                          className={cn(
                            "px-4 py-2 text-sm transition-all",
                            choice.selected === 0 
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg" 
                              : "bg-white/10 text-white/60 border-white/20"
                          )}
                        >
                          {choice.option_a}
                        </Badge>
                        <span className="text-sm text-white/50 font-medium">or</span>
                        <Badge 
                          className={cn(
                            "px-4 py-2 text-sm transition-all",
                            choice.selected === 1 
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg" 
                              : "bg-white/10 text-white/60 border-white/20"
                          )}
                        >
                          {choice.option_b}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video */}
            {datingProfile.video_url && (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-white text-lg flex items-center space-x-2 mb-4">
                    <Video className="w-5 h-5 text-red-400" />
                    <span>Video</span>
                  </h3>
                  <div className="aspect-video bg-black/30 rounded-xl overflow-hidden border border-white/10 shadow-inner">
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
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-white text-lg flex items-center space-x-2 mb-4">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    <span>Career & Education</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matrimonyProfile.career.highest_education && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Education</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.career.highest_education}</p>
                      </div>
                    )}
                    {matrimonyProfile.career.job_title && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Profession</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.career.job_title}</p>
                      </div>
                    )}
                    {matrimonyProfile.career.company && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Company</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.career.company}</p>
                      </div>
                    )}
                    {matrimonyProfile.career.work_location && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Location</p>
                        <p className="text-sm text-white font-medium">
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
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-white text-lg mb-4">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matrimonyProfile.personal.diet && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Diet</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.personal.diet}</p>
                      </div>
                    )}
                    {matrimonyProfile.personal.smoker !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Smoking</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.personal.smoker ? "Yes" : "No"}</p>
                      </div>
                    )}
                    {matrimonyProfile.personal.drinker !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Drinking</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.personal.drinker ? "Yes" : "No"}</p>
                      </div>
                    )}
                    {matrimonyProfile.personal.complexion && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Complexion</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.personal.complexion}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Family Information */}
            {matrimonyProfile.family && matrimonyProfile.family.show_on_profile && (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-white text-lg flex items-center space-x-2 mb-4">
                    <Home className="w-5 h-5 text-orange-400" />
                    <span>Family Information</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matrimonyProfile.family.family_type && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Family Type</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.family.family_type}</p>
                      </div>
                    )}
                    {matrimonyProfile.family.family_values && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Family Values</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.family.family_values}</p>
                      </div>
                    )}
                    {matrimonyProfile.family.father_occupation && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Father's Occupation</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.family.father_occupation}</p>
                      </div>
                    )}
                    {matrimonyProfile.family.mother_occupation && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Mother's Occupation</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.family.mother_occupation}</p>
                      </div>
                    )}
                    {(matrimonyProfile.family.brothers !== undefined || matrimonyProfile.family.sisters !== undefined) && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Siblings</p>
                        <p className="text-sm text-white font-medium">
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
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-white text-lg flex items-center space-x-2 mb-4">
                    <Users className="w-5 h-5 text-green-400" />
                    <span>Cultural Background</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {matrimonyProfile.cultural.religion && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Religion</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.cultural.religion}</p>
                      </div>
                    )}
                    {matrimonyProfile.cultural.mother_tongue && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Mother Tongue</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.cultural.mother_tongue}</p>
                      </div>
                    )}
                    {matrimonyProfile.cultural.community && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Community</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.cultural.community}</p>
                      </div>
                    )}
                    {matrimonyProfile.cultural.star_raashi && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Star/Raashi</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.cultural.star_raashi}</p>
                      </div>
                    )}
                    {matrimonyProfile.cultural.gotra && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Gotra</p>
                        <p className="text-sm text-white font-medium">{matrimonyProfile.cultural.gotra}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!profile && (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-6">
              <p className="text-white/70 text-center">No profile data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
