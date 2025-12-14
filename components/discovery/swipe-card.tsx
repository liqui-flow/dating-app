"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, MapPin, X, Heart, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { SwipeAnimations, useSwipeAnimation } from "./swipe-animations"
import { getDatingProfile, type DatingProfileFull } from "@/lib/datingProfileService"
import { ReportDialog } from "@/components/chat/report-dialog"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: string
  name: string
  age: number
  location: string
  occupation: string
  education: string
  photos: string[]
  bio: string
  interests: string[]
  religion: string
  verified: boolean
  premium: boolean
  distance: string
}

interface SwipeCardProps {
  profile: Profile
  onLike: () => void
  onPass: () => void
  onProfileClick: () => void
  stackIndex?: number // 0 is top, then 1,2 for depth visuals
}

export function SwipeCard({ profile, onLike, onPass, onProfileClick, stackIndex = 0 }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [fullProfile, setFullProfile] = useState<DatingProfileFull | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { animation, showHeartBurst, showXBurst, hideAnimation } = useSwipeAnimation()
  const { toast } = useToast()
  
  // Motion value for 3D rotation
  const rotateY = useMotionValue(0)
  
  // Base height for card expansion calculation
  const baseHeight = "h-[55vh] sm:h-[60vh] md:h-[480px]"

  const visibleInterests = profile.interests.slice(0, 4)
  const remainingInterestCount = Math.max(0, profile.interests.length - visibleInterests.length)
  const highlightItems = [
    { label: "Location", value: profile.location },
    { label: "Work", value: profile.occupation },
    { label: "Education", value: profile.education },
    { label: "Values", value: profile.religion },
  ].filter((item) => item.value && item.value.trim().length > 0)

  // Framer Motion values for smooth dragging
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Transform motion values to rotation with smoother curve
  const rotate = useTransform(x, [-400, 400], [-25, 25])
  
  // Visual feedback during drag - opacity and scale (renamed to avoid conflicts)
  const dragOpacity = useTransform(x, [-400, -100, 100, 400], [0.7, 1, 1, 0.7])
  const dragScale = useTransform(x, [-400, 0, 400], [0.95, 1, 0.95])
  
  // Like/Pass overlay opacity based on drag direction
  const likeOverlayOpacity = useTransform(x, [0, 100, 200], [0, 0.3, 0.6])
  const passOverlayOpacity = useTransform(x, [0, -100, -200], [0, 0.3, 0.6])

  const depthStyles = useMemo(() => {
    // Enhanced visual stacking for realistic deck-of-cards effect
    const scale = 1 - stackIndex * 0.04 // Slightly less scaling for more subtle effect
    const translateY = stackIndex * 12 // Vertical offset - cards stack downward
    const translateX = stackIndex * 8  // Horizontal offset - cards shift right
    const opacity = Math.max(0.3, 1 - stackIndex * 0.25) // Keep cards more visible
    const rotate = stackIndex * 1.5 // Slight rotation for natural look
    
    return { 
      scale, 
      translateY, 
      translateX, 
      opacity, 
      rotate,
      zIndex: 30 - stackIndex 
    }
  }, [stackIndex])

  const handlePhotoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Prevent photo click if dragging or if drag offset is significant
    if (Math.abs(x.get()) > 8) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const cardWidth = rect.width

    if (clickX > cardWidth / 2) {
      // Right side - next photo
      if (currentPhotoIndex < profile.photos.length - 1) {
        setCurrentPhotoIndex((prev) => prev + 1)
      }
    } else {
      // Left side - previous photo
      if (currentPhotoIndex > 0) {
        setCurrentPhotoIndex((prev) => prev - 1)
      }
    }
  }

  const handleDragEnd = (event: any, info: any) => {
    // Lower threshold for easier swiping, better velocity detection
    const threshold = 80
    const velocity = info.velocity.x
    const velocityThreshold = 300 // Lower velocity threshold for more responsive swipes
    
    // Use both distance and velocity for more natural feel
    const shouldLike = info.offset.x > threshold || velocity > velocityThreshold
    const shouldPass = info.offset.x < -threshold || velocity < -velocityThreshold
    
    if (shouldLike) {
      // Like - trigger heart animation and swipe out with smooth spring
      showHeartBurst()
      animate(x, 1000, { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.5
      })
      setTimeout(() => {
        onLike()
      }, 300)
    } else if (shouldPass) {
      // Pass - swipe out with smooth spring (no X animation)
      animate(x, -1000, { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.5
      })
      setTimeout(() => {
        onPass()
      }, 300)
    } else {
      // Reset card position smoothly with optimized spring animation
      animate(x, 0, { 
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 0.6
      })
      animate(y, 0, { 
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 0.6
      })
    }
  }

  const handleInfoClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (stackIndex === 0) {
      const newFlippedState = !isFlipped
      setIsFlipped(newFlippedState)
      
      // Fetch full profile data when flipping to back side
      if (newFlippedState && !fullProfile) {
        setLoadingProfile(true)
        try {
          const result = await getDatingProfile(profile.id)
          if (result.success && result.data) {
            setFullProfile(result.data as DatingProfileFull)
          }
        } catch (error) {
          console.error("Error fetching full profile:", error)
        } finally {
          setLoadingProfile(false)
        }
      }
      
      animate(rotateY, newFlippedState ? 180 : 0, {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for natural motion
      })
    }
  }

  // Transform rotateY to scale for slight expansion during flip
  const scaleValue = useTransform(rotateY, [0, 90, 180], [1, 1.05, 1])
  
  // Transform for back side opacity (fade in as card turns)
  const backOpacity = useTransform(rotateY, [90, 180], [0, 1])
  const frontOpacity = useTransform(rotateY, [0, 90], [1, 0])
  
  // Combined transforms for final style values
  // Use useTransform to combine drag feedback with depth styles
  const combinedScale = useTransform(
    dragScale,
    (ds) => ds * depthStyles.scale
  )
  const combinedOpacity = useTransform(
    dragOpacity,
    (doVal) => doVal * depthStyles.opacity
  )

  const getInitial = (value?: string) => {
    const trimmed = value?.trim()
    return trimmed && trimmed.length > 0 ? trimmed[0]!.toUpperCase() : "?"
  }

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [])

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentUserId) {
      setShowReportDialog(true)
    }
  }

  const handleReportSuccess = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for helping keep our community safe.",
    })
  }

  const cardInitial = getInitial(profile.name)

  return (
    <>
      {/* Swipe Animations - overlay disabled */}
      <SwipeAnimations 
        show={animation.show} 
        type={animation.type} 
        onComplete={hideAnimation}
        hideOverlay={true}
      />

      <motion.div
        className={cn(
          "w-full max-w-xs sm:max-w-sm cursor-grab active:cursor-grabbing select-none touch-none",
          "relative",
          // 3D perspective container
          "perspective-[1200px]",
          // Enhanced shadows for realistic depth
          stackIndex === 0 && "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_10px_30px_-10px_rgba(0,0,0,0.3)]",
          stackIndex === 1 && "shadow-[0_15px_45px_-12px_rgba(0,0,0,0.35),0_8px_25px_-8px_rgba(0,0,0,0.25)]",
          stackIndex === 2 && "shadow-[0_12px_35px_-10px_rgba(0,0,0,0.3),0_6px_20px_-6px_rgba(0,0,0,0.2)]",
          stackIndex > 2 && "shadow-[0_8px_25px_-8px_rgba(0,0,0,0.25),0_4px_15px_-4px_rgba(0,0,0,0.15)]",
          // Height expansion when flipped: +10% top, +30% bottom = 1.4x total
          stackIndex === 0 && isFlipped ? "h-[77vh] sm:h-[84vh] md:h-[672px]" : baseHeight
        )}
        style={{
          x,
          y,
          rotate: stackIndex === 0 ? rotate : depthStyles.rotate,
          scale: stackIndex === 0 ? combinedScale : depthStyles.scale,
          translateY: depthStyles.translateY,
          translateX: depthStyles.translateX,
          zIndex: depthStyles.zIndex,
          opacity: stackIndex === 0 ? combinedOpacity : depthStyles.opacity,
        }}
        drag={stackIndex === 0 && !isFlipped ? true : false}
        dragConstraints={{ left: -500, right: 500, top: -200, bottom: 200 }}
        dragElastic={0.7}
        dragMomentum={true}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        onDragEnd={handleDragEnd}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 0.6
        }}
      >
        {/* 3D Flip Container */}
        <motion.div
          className="relative w-full h-full"
          style={{
            rotateY: rotateY,
            scale: stackIndex === 0 ? scaleValue : depthStyles.scale,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front Side */}
          <motion.div
            className={cn(
              "absolute inset-0 w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl",
              "backface-hidden"
            )}
            style={{
              opacity: stackIndex === 0 ? frontOpacity : 1,
              rotateY: 0,
              transformStyle: "preserve-3d",
            }}
            onClick={handlePhotoClick}
          >
      {/* Background photo fills the card */}
      <img
        src={profile.photos[currentPhotoIndex] || "/placeholder.svg"}
        alt=""
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-300",
          stackIndex === 1 && "blur-[2px] brightness-75 contrast-90",
          stackIndex === 2 && "blur-[4px] brightness-65 contrast-80",
          stackIndex > 2 && "blur-[6px] brightness-60 contrast-75",
        )}
      />

      {/* Frosted glass overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/60" />
      
      {/* Subtle frosted glass effect on top portion */}
      {stackIndex === 0 && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent backdrop-blur-[0.5px]" />
      )}

      {/* Top-right status badges */}
      {stackIndex === 0 && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col space-y-1 sm:space-y-2 z-20">
          {profile.premium && <Badge className="bg-[#97011A] text-white text-xs px-2 py-1">Premium</Badge>}
        </div>
      )}

      {/* Bottom profile information overlay - Simplified design */}
      {stackIndex === 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Dark gradient overlay */}
          <div className="bg-gradient-to-t from-black/80 via-black/60 to-transparent h-32 rounded-b-2xl sm:rounded-b-3xl" />
          
          {/* Profile information */}
          <div className="absolute bottom-4 left-4 right-16 z-10">
            <h2 className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg mb-1">
              {cardInitial}, {profile.age}
            </h2>
            {profile.location && (
              <div className="flex items-center space-x-1 text-white/90">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">{profile.location}</span>
              </div>
            )}
          </div>

          {/* Info button at bottom right */}
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className={cn(
              "absolute bottom-4 right-4 z-30",
              "w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full",
              "bg-white/90 backdrop-blur-md border border-black/10",
              "hover:bg-white hover:scale-110",
              "transition-all duration-200",
              "shadow-lg"
            )}
            onClick={handleInfoClick}
            aria-label="View full profile"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-black drop-shadow-sm" />
          </Button>
        </div>
      )}

            {/* Visible card edges for stacked cards */}
            {stackIndex > 0 && (
              <>
                {/* Right edge highlight */}
                <div className="absolute -right-1 top-2 bottom-2 w-2 bg-gradient-to-b from-[#97011A]/60 via-[#97011A]/70 to-[#97011A]/60 rounded-r-full shadow-lg" />
                {/* Bottom edge highlight */}
                <div className="absolute -bottom-1 left-2 right-2 h-2 bg-gradient-to-r from-[#97011A]/40 via-[#97011A]/50 to-[#97011A]/40 rounded-b-full shadow-lg" />
              </>
            )}

            {/* Dim overlay for behind cards to hide details */}
            {stackIndex > 0 && <div className="absolute inset-0 bg-white/30" />}
          </motion.div>

          {/* Back Side - Full Profile */}
          {stackIndex === 0 && (
            <motion.div
              className={cn(
                "absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden",
                "rounded-2xl sm:rounded-3xl",
                "backface-hidden",
                "hide-scrollbar"
              )}
              style={{
                opacity: backOpacity,
                rotateY: 180,
                transformStyle: "preserve-3d",
              }}
            >
              {loadingProfile ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-white">Loading profile...</div>
                </div>
              ) : (
                <>
                  {/* Black Overlay Header with Name and Age */}
                  <div className="sticky top-0 z-40 bg-white backdrop-blur-sm border-b border-black/10 rounded-t-2xl sm:rounded-t-3xl">
                    <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-black">
                          {(fullProfile?.name || profile.name)}, {profile.age}
                        </h1>
                        {profile.location && (
                          <div className="flex items-center space-x-1 text-black/70 text-sm mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              className={cn(
                                "w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full",
                                "bg-white border-2 border-black/10",
                                "hover:bg-[#97011A] hover:border-[#97011A] hover:scale-110",
                                "transition-all duration-200",
                                "shadow-md group"
                              )}
                              onClick={handleReportClick}
                              aria-label="Report profile"
                            >
                              <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-black group-hover:text-white transition-colors" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-[#97011A] text-white border-[#97011A]">
                            <p>Report</p>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className={cn(
                            "w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full",
                            "bg-white border-2 border-black/10",
                            "hover:bg-black/5 hover:scale-110",
                            "transition-all duration-200",
                            "shadow-md"
                          )}
                          onClick={handleInfoClick}
                          aria-label="Close profile"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="relative bg-white overflow-hidden">
                    {(() => {
                      const photos = fullProfile?.photos || profile.photos
                      const photoPrompts = (fullProfile?.photo_prompts as string[]) || []
                      
                      return (
                        <>
                          {/* Profile Picture (1st photo) */}
                          {photos.length > 0 && (
                            <div className="relative w-full bg-white px-4 sm:px-6 pt-6">
                              <div className="relative w-full aspect-square mx-auto rounded-xl sm:rounded-2xl overflow-hidden">
                                <img
                                  src={photos[0] || "/placeholder.svg"}
                                  alt="Profile photo"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {photoPrompts[0] && photoPrompts[0].trim() && (
                                <p className="text-black/70 text-sm sm:text-base mt-3 text-center px-2">
                                  {photoPrompts[0]}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Profile Information Sections */}
                          <div className="px-4 sm:px-6 py-6 space-y-6">
                            {/* Bio Section */}
                            {(fullProfile?.bio || profile.bio) && (
                              <div className="space-y-3">
                                <h3 className="font-semibold text-black text-base sm:text-lg mb-2">About</h3>
                                <p className="text-black/80 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                                  {fullProfile?.bio || profile.bio}
                                </p>
                              </div>
                            )}

                            {/* 2nd Picture */}
                            {photos.length > 1 && (
                              <div className="relative w-full space-y-3">
                                <div className="relative w-full aspect-square mx-auto rounded-xl sm:rounded-2xl overflow-hidden">
                                  <img
                                    src={photos[1] || "/placeholder.svg"}
                                    alt="Photo 2"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {photoPrompts[1] && photoPrompts[1].trim() && (
                                  <p className="text-white/80 text-sm sm:text-base text-center px-2">
                                    {photoPrompts[1]}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Interests Section */}
                            {(() => {
                              const interests = fullProfile?.interests || profile.interests
                              return interests && interests.length > 0 ? (
                                <div className="space-y-3">
                                  <h3 className="font-semibold text-white text-base sm:text-lg">Interests</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {interests.map((interest, idx) => (
                                      <Badge
                                        key={idx}
                                        className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white/90"
                                      >
                                        {interest}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ) : null
                            })()}

                            {/* 3rd Picture */}
                            {photos.length > 2 && (
                              <div className="relative w-full space-y-3">
                                <div className="relative w-full aspect-square mx-auto rounded-xl sm:rounded-2xl overflow-hidden">
                                  <img
                                    src={photos[2] || "/placeholder.svg"}
                                    alt="Photo 3"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {photoPrompts[2] && photoPrompts[2].trim() && (
                                  <p className="text-white/80 text-sm sm:text-base text-center px-2">
                                    {photoPrompts[2]}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Get to Know Me Section (formerly Prompts) */}
                            {fullProfile?.prompts && fullProfile.prompts.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="font-semibold text-white text-base sm:text-lg">Get to Know Me</h3>
                                {fullProfile.prompts.map((promptItem, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 space-y-2"
                                  >
                                    <p className="text-white/80 text-sm font-medium">{promptItem.prompt}</p>
                                    <p className="text-white text-base">{promptItem.answer}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 4th Picture (if exists, between Get to Know Me and This or That) */}
                            {photos.length > 3 && (
                              <div className="relative w-full space-y-3">
                                <div className="relative w-full aspect-square mx-auto rounded-xl sm:rounded-2xl overflow-hidden">
                                  <img
                                    src={photos[3] || "/placeholder.svg"}
                                    alt="Photo 4"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {photoPrompts[3] && photoPrompts[3].trim() && (
                                  <p className="text-white/80 text-sm sm:text-base text-center px-2">
                                    {photoPrompts[3]}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* This or That Section */}
                            {fullProfile?.this_or_that_choices && fullProfile.this_or_that_choices.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="font-semibold text-white text-base sm:text-lg">This or That</h3>
                                {fullProfile.this_or_that_choices.map((choice, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "flex-1 p-3 rounded-lg text-center text-sm",
                                        choice.selected === 0 
                                          ? "bg-white/20 text-white font-semibold" 
                                          : "bg-white/5 text-white/60"
                                      )}>
                                        {choice.option_a}
                                      </div>
                                      <span className="text-white/40">vs</span>
                                      <div className={cn(
                                        "flex-1 p-3 rounded-lg text-center text-sm",
                                        choice.selected === 1 
                                          ? "bg-white/20 text-white font-semibold" 
                                          : "bg-white/5 text-white/60"
                                      )}>
                                        {choice.option_b}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Relationship Goals Section */}
                            {fullProfile?.relationship_goals && (
                              <div className="space-y-2">
                                <h3 className="font-semibold text-white text-base sm:text-lg">Relationship Goals</h3>
                                <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                                  {fullProfile.relationship_goals}
                                </p>
                              </div>
                            )}

                            {/* Video Section */}
                            {fullProfile?.video_url && (
                              <div className="space-y-3">
                                <h3 className="font-semibold text-white text-base sm:text-lg">Video</h3>
                                <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black/50">
                                  <video
                                    src={fullProfile.video_url}
                                    controls
                                    className="w-full h-full object-cover"
                                    playsInline
                                  />
                                </div>
                              </div>
                            )}

                            {/* Action Buttons at Bottom */}
                            <div className="flex items-center justify-center space-x-6 pt-6 pb-8">
                              <Button
                                variant="outline"
                                size="lg"
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent border-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleInfoClick(e)
                                  setTimeout(() => onPass(), 300)
                                }}
                              >
                                <X className="w-8 h-8 sm:w-10 sm:h-10" />
                              </Button>

                              <Button
                                size="lg"
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0 bg-gradient-to-r from-[#97011A] to-[#7A0115] hover:from-[#7A0115] hover:to-[#97011A] text-white shadow-lg"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleInfoClick(e)
                                  setTimeout(() => onLike(), 300)
                                }}
                              >
                                <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Report Dialog */}
      {currentUserId && (
        <ReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          reportedUserId={profile.id}
          reporterId={currentUserId}
          matchType="dating"
          userName={profile.name}
          onSuccess={handleReportSuccess}
        />
      )}
    </>
  )
}
