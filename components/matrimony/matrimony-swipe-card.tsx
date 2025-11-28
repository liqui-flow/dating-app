"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, X, Info, MoreHorizontal, MapPin, Briefcase, GraduationCap, Users, ChevronLeft, ChevronRight, Flag, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { SwipeAnimations, useSwipeAnimation } from "../discovery/swipe-animations"
import { MatrimonyProfileModal } from "./matrimony-profile-modal"
import { getMatrimonyProfile, type MatrimonyProfileFull } from "@/lib/matrimonyService"

interface MatrimonySwipeCardProps {
  profileId: string // user_id for fetching full profile
  name: string
  age: number
  height?: string
  profession: string
  community?: string
  location: string
  photos: string[] // Changed from avatar to photos array
  verified?: boolean
  premium?: boolean
  bio?: string
  interests?: string[]
  education?: string
  onConnect: () => void
  onNotNow: () => void
  onProfileClick?: () => void
  stackIndex?: number // 0 is top, then 1,2 for depth visuals
  isShortlisted?: boolean
  onToggleShortlist?: () => Promise<any> | void
}

export function MatrimonySwipeCard({
  profileId,
  name,
  age,
  height,
  profession,
  community,
  location,
  photos,
  verified,
  premium,
  bio,
  interests,
  education,
  onConnect,
  onNotNow,
  onProfileClick,
  stackIndex = 0,
  isShortlisted = false,
  onToggleShortlist,
}: MatrimonySwipeCardProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [expandedPhotoIndex, setExpandedPhotoIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [fullProfile, setFullProfile] = useState<MatrimonyProfileFull | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [shortlistBusy, setShortlistBusy] = useState(false)
  const handleShortlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onToggleShortlist || shortlistBusy) return
    setShortlistBusy(true)
    try {
      await onToggleShortlist()
    } finally {
      setShortlistBusy(false)
    }
  }

  const { animation, showHeartBurst, showXBurst, hideAnimation } = useSwipeAnimation()
  
  // Motion value for 3D rotation
  const rotateY = useMotionValue(0)

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
      if (currentPhotoIndex < photos.length - 1) {
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
    const shouldConnect = info.offset.x > threshold || velocity > velocityThreshold
    const shouldNotNow = info.offset.x < -threshold || velocity < -velocityThreshold
    
    if (shouldConnect) {
      // Connect - trigger heart animation and swipe out with smooth spring
      showHeartBurst()
      animate(x, 1000, { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.5
      })
      setTimeout(() => {
        onConnect()
      }, 300)
    } else if (shouldNotNow) {
      // Not Now - swipe out with smooth spring (no X animation)
      animate(x, -1000, { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.5
      })
      setTimeout(() => {
        onNotNow()
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
      
      // Reset photo index when flipping
      if (newFlippedState) {
        setExpandedPhotoIndex(0)
      }
      
      // Fetch full profile data when flipping to back side
      if (newFlippedState && !fullProfile) {
        setLoadingProfile(true)
        try {
          const result = await getMatrimonyProfile(profileId)
          if (result.success && result.data) {
            setFullProfile(result.data as MatrimonyProfileFull)
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
  
  const handlePhotoNavigation = (direction: 'prev' | 'next', e?: React.MouseEvent) => {
    e?.stopPropagation()
    const profilePhotos = fullProfile?.photos || photos
    if (direction === 'next' && expandedPhotoIndex < profilePhotos.length - 1) {
      setExpandedPhotoIndex(prev => prev + 1)
    } else if (direction === 'prev' && expandedPhotoIndex > 0) {
      setExpandedPhotoIndex(prev => prev - 1)
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

  // Prepare highlight items for back side
  const highlightItems = [
    { label: "Location", value: location, icon: MapPin },
    { label: "Profession", value: profession, icon: Briefcase },
    { label: "Education", value: education, icon: GraduationCap },
    { label: "Community", value: community, icon: Users },
  ].filter((item) => item.value && item.value.trim().length > 0)

  return (
    <>
      {/* Swipe Animations */}
      <SwipeAnimations 
        show={animation.show} 
        type={animation.type} 
        onComplete={hideAnimation}
        hideOverlay={true}
      />

      <motion.div
        className={cn(
          "w-full max-w-sm cursor-grab active:cursor-grabbing select-none touch-none",
          "relative",
          // 3D perspective container
          "perspective-[1200px]",
          // Base height for card expansion calculation
          stackIndex === 0 && isFlipped ? "h-[77vh] sm:h-[84vh] md:h-[672px]" : "h-[60vh] md:h-[480px]",
          // Enhanced shadows for realistic depth
          stackIndex === 0 && "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_10px_30px_-10px_rgba(0,0,0,0.3)]",
          stackIndex === 1 && "shadow-[0_15px_45px_-12px_rgba(0,0,0,0.35),0_8px_25px_-8px_rgba(0,0,0,0.25)]",
          stackIndex === 2 && "shadow-[0_12px_35px_-10px_rgba(0,0,0,0.3),0_6px_20px_-6px_rgba(0,0,0,0.2)]",
          stackIndex > 2 && "shadow-[0_8px_25px_-8px_rgba(0,0,0,0.25),0_4px_15px_-4px_rgba(0,0,0,0.15)]",
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
              "absolute inset-0 w-full h-full overflow-hidden rounded-3xl",
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
        src={photos[currentPhotoIndex] || "/placeholder.svg"}
        alt=""
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-300",
          stackIndex === 1 && "blur-[2px] brightness-75 contrast-90",
          stackIndex === 2 && "blur-[4px] brightness-65 contrast-80",
          stackIndex > 2 && "blur-[6px] brightness-60 contrast-75",
        )}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          if (target.src !== "/placeholder.svg") {
            target.src = "/placeholder.svg"
          }
        }}
        crossOrigin="anonymous"
      />

      {/* Frosted glass overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/60" />
      
      {/* Subtle frosted glass effect on top portion */}
      {stackIndex === 0 && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent backdrop-blur-[0.5px]" />
      )}

      {/* Top-right controls */}
      {stackIndex === 0 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {onToggleShortlist && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
              aria-pressed={isShortlisted}
              onClick={handleShortlistClick}
              className={cn(
                "w-9 h-9 rounded-full border border-white/40 backdrop-blur bg-black/40 flex items-center justify-center shadow-lg transition-colors",
                isShortlisted ? "text-red-400 border-red-400 bg-black/60" : "text-white/80 hover:text-white",
                shortlistBusy && "opacity-60 pointer-events-none",
              )}
            >
              <Heart className="w-4 h-4" fill={isShortlisted ? "currentColor" : "none"} strokeWidth={1.8} />
            </motion.button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full p-0 hover:bg-white/30"
            onClick={handleInfoClick}
          >
            <MoreHorizontal className="w-4 h-4 text-white" />
          </Button>
        </div>
      )}

      {/* Bottom profile information overlay - Simplified design */}
      {stackIndex === 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Dark gradient overlay */}
          <div className="bg-gradient-to-t from-black/80 via-black/60 to-transparent h-40 rounded-b-3xl" />
          
          {/* Profile information - positioned above the buttons */}
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <h2 className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg mb-1">
              {name}, {age}
            </h2>
            {location && (
              <div className="flex items-center space-x-1 text-white/90">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">{location}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Glass circle with X mark in bottom left corner */}
      {stackIndex === 0 && (
        <div className="absolute bottom-4 left-4 z-30">
          <div 
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-200 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              // Swipe out (no X animation)
              animate(x, -1000, { 
                type: "spring",
                stiffness: 200,
                damping: 20,
                mass: 0.5
              })
              setTimeout(() => {
                onNotNow()
              }, 300)
            }}
          >
            <X className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
        </div>
      )}

      {/* Glass circle with tick mark in bottom right corner */}
      {stackIndex === 0 && (
        <div className="absolute bottom-4 right-4 z-30">
          <div 
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-200 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              // Trigger heart animation and swipe out
              showHeartBurst()
              animate(x, 1000, { duration: 0.4, ease: "easeInOut" })
              setTimeout(() => {
                onConnect()
              }, 400)
            }}
          >
            <Check className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
        </div>
      )}


            {/* Visible card edges for stacked cards */}
            {stackIndex > 0 && (
              <>
                {/* Right edge highlight */}
                <div className="absolute -right-1 top-2 bottom-2 w-2 bg-gradient-to-b from-blue-400/60 via-blue-500/70 to-blue-400/60 rounded-r-full shadow-lg" />
                {/* Bottom edge highlight */}
                <div className="absolute -bottom-1 left-2 right-2 h-2 bg-gradient-to-r from-blue-400/40 via-blue-500/50 to-blue-400/40 rounded-b-full shadow-lg" />
              </>
            )}

            {/* Dim overlay for behind cards to hide details */}
            {stackIndex > 0 && <div className="absolute inset-0 bg-black/20" />}
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
                  <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-white/10 rounded-t-2xl sm:rounded-t-3xl">
                    <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                          {fullProfile?.name || name}, {fullProfile?.age || age}
                        </h1>
                        {location && (
                          <div className="flex items-center space-x-1 text-white/80 text-sm mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{location}</span>
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
                                "bg-white/20 backdrop-blur-md border border-white/30",
                                "hover:bg-red-500 hover:border-red-500 hover:scale-110",
                                "transition-all duration-200",
                                "shadow-lg"
                              )}
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle report functionality
                                console.log("Report user:", profileId)
                              }}
                              aria-label="Report profile"
                            >
                              <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-red-500 text-white border-red-400">
                            <p>Report</p>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className={cn(
                            "w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full",
                            "bg-white/20 backdrop-blur-md border border-white/30",
                            "hover:bg-white/30 hover:scale-110",
                            "transition-all duration-200",
                            "shadow-lg"
                          )}
                          onClick={handleInfoClick}
                          aria-label="Close profile"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="relative bg-gradient-to-b from-black/95 via-black/90 to-black/95 overflow-hidden">
                    {/* Photo Gallery Section */}
                    <div className="relative w-full bg-black px-4 sm:px-6 pt-6">
                      <div className="relative w-full aspect-square mx-auto rounded-xl sm:rounded-2xl overflow-hidden">
                        {(() => {
                          const profilePhotos = fullProfile?.photos || photos
                          const currentPhoto = profilePhotos[expandedPhotoIndex] || "/placeholder.svg"
                          
                          return (
                            <>
                              <img
                                src={currentPhoto}
                                alt={`Photo ${expandedPhotoIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            
                            {/* Photo Navigation Arrows */}
                            {profilePhotos.length > 1 && (
                              <>
                                {expandedPhotoIndex > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 z-20"
                                    onClick={(e) => handlePhotoNavigation('prev', e)}
                                  >
                                    <ChevronLeft className="w-5 h-5 text-white" />
                                  </Button>
                                )}
                                {expandedPhotoIndex < profilePhotos.length - 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 z-20"
                                    onClick={(e) => handlePhotoNavigation('next', e)}
                                  >
                                    <ChevronRight className="w-5 h-5 text-white" />
                                  </Button>
                                )}
                                
                                {/* Photo Counter */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs z-20">
                                  {expandedPhotoIndex + 1} / {profilePhotos.length}
                                </div>
                              </>
                            )}
                          </>
                        )
                      })()}
                      </div>
                    </div>

                    {/* Profile Information Sections */}
                    <div className="px-4 sm:px-6 py-6 space-y-6">
                      {/* Bio Section */}
                      {(fullProfile?.bio || bio) && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-white text-base sm:text-lg">About</h3>
                          <p className="text-white/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                            {fullProfile?.bio || bio}
                          </p>
                        </div>
                      )}

                      {/* Personal Details Section */}
                      {fullProfile?.personal && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-white text-base sm:text-lg">Personal Details</h3>
                          <div className="space-y-2">
                            {fullProfile.personal.height_cm && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Height: </span>
                                {fullProfile.personal.height_unit === 'ft' 
                                  ? (() => {
                                      const totalInches = Math.round(fullProfile.personal.height_cm! / 2.54)
                                      const feet = Math.floor(totalInches / 12)
                                      const inches = totalInches % 12
                                      return `${feet}'${inches}"`
                                    })()
                                  : `${fullProfile.personal.height_cm} cm`}
                              </div>
                            )}
                            {fullProfile.personal.complexion && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Complexion: </span>
                                {fullProfile.personal.complexion}
                              </div>
                            )}
                            {fullProfile.personal.body_type && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Body Type: </span>
                                {fullProfile.personal.body_type}
                              </div>
                            )}
                            {fullProfile.personal.diet && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Diet: </span>
                                {fullProfile.personal.diet}
                              </div>
                            )}
                            {fullProfile.personal.marital_status && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Marital Status: </span>
                                {fullProfile.personal.marital_status}
                              </div>
                            )}
                            {(fullProfile.personal.smoker !== undefined || fullProfile.personal.drinker !== undefined) && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Lifestyle: </span>
                                {[
                                  fullProfile.personal.smoker ? 'Smoker' : null,
                                  fullProfile.personal.drinker ? 'Drinker' : null
                                ].filter(Boolean).join(', ') || 'Non-smoker, Non-drinker'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Career & Education Section */}
                      {fullProfile?.career && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-white text-base sm:text-lg">Career & Education</h3>
                          <div className="space-y-2">
                            {fullProfile.career.highest_education && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Education: </span>
                                {fullProfile.career.highest_education}
                                {fullProfile.career.college && `, ${fullProfile.career.college}`}
                              </div>
                            )}
                            {fullProfile.career.job_title && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Profession: </span>
                                {fullProfile.career.job_title}
                                {fullProfile.career.company && ` at ${fullProfile.career.company}`}
                              </div>
                            )}
                            {fullProfile.career.annual_income && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Annual Income: </span>
                                {fullProfile.career.annual_income}
                              </div>
                            )}
                            {fullProfile.career.work_location && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Work Location: </span>
                                {[
                                  fullProfile.career.work_location.city,
                                  fullProfile.career.work_location.state,
                                  fullProfile.career.work_location.country
                                ].filter(Boolean).join(', ') || 'Not specified'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Family Information Section */}
                      {fullProfile?.family && fullProfile.family.show_on_profile && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-white text-base sm:text-lg">Family Information</h3>
                          <div className="space-y-2">
                            {fullProfile.family.family_type && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Family Type: </span>
                                {fullProfile.family.family_type}
                              </div>
                            )}
                            {fullProfile.family.family_values && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Family Values: </span>
                                {fullProfile.family.family_values}
                              </div>
                            )}
                            {(fullProfile.family.father_occupation || fullProfile.family.mother_occupation) && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Parents: </span>
                                {[
                                  fullProfile.family.father_occupation && `Father - ${fullProfile.family.father_occupation}${fullProfile.family.father_company ? ` (${fullProfile.family.father_company})` : ''}`,
                                  fullProfile.family.mother_occupation && `Mother - ${fullProfile.family.mother_occupation}${fullProfile.family.mother_company ? ` (${fullProfile.family.mother_company})` : ''}`
                                ].filter(Boolean).join(', ')}
                              </div>
                            )}
                            {(fullProfile.family.brothers !== undefined || fullProfile.family.sisters !== undefined) && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Siblings: </span>
                                {[
                                  fullProfile.family.brothers !== undefined && fullProfile.family.brothers > 0 && `${fullProfile.family.brothers} brother${fullProfile.family.brothers > 1 ? 's' : ''}`,
                                  fullProfile.family.sisters !== undefined && fullProfile.family.sisters > 0 && `${fullProfile.family.sisters} sister${fullProfile.family.sisters > 1 ? 's' : ''}`
                                ].filter(Boolean).join(', ') || 'None'}
                              </div>
                            )}
                            {fullProfile.family.siblings_married && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Siblings Married: </span>
                                {fullProfile.family.siblings_married}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cultural & Religious Section */}
                      {fullProfile?.cultural && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-white text-base sm:text-lg">Cultural & Religious</h3>
                          <div className="space-y-2">
                            {fullProfile.cultural.religion && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Religion: </span>
                                {fullProfile.cultural.religion}
                              </div>
                            )}
                            {fullProfile.cultural.mother_tongue && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Mother Tongue: </span>
                                {fullProfile.cultural.mother_tongue}
                              </div>
                            )}
                            {fullProfile.cultural.community && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Community: </span>
                                {fullProfile.cultural.community}
                              </div>
                            )}
                            {fullProfile.cultural.sub_caste && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Sub-caste: </span>
                                {fullProfile.cultural.sub_caste}
                              </div>
                            )}
                            {fullProfile.cultural.date_of_birth && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Date of Birth: </span>
                                {new Date(fullProfile.cultural.date_of_birth).toLocaleDateString()}
                              </div>
                            )}
                            {fullProfile.cultural.time_of_birth && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Time of Birth: </span>
                                {fullProfile.cultural.time_of_birth}
                              </div>
                            )}
                            {fullProfile.cultural.place_of_birth && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Place of Birth: </span>
                                {fullProfile.cultural.place_of_birth}
                              </div>
                            )}
                            {fullProfile.cultural.star_raashi && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Star/Raashi: </span>
                                {fullProfile.cultural.star_raashi}
                              </div>
                            )}
                            {fullProfile.cultural.gotra && (
                              <div className="text-white/90 text-sm sm:text-base">
                                <span className="text-white/60">Gotra: </span>
                                {fullProfile.cultural.gotra}
                              </div>
                            )}
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
                            setTimeout(() => onNotNow(), 300)
                          }}
                        >
                          <X className="w-8 h-8 sm:w-10 sm:h-10" />
                        </Button>

                        <Button
                          size="lg"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInfoClick(e)
                            setTimeout(() => onConnect(), 300)
                          }}
                        >
                          <Check className="w-8 h-8 sm:w-10 sm:h-10" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

    {/* Profile Modal */}
    <MatrimonyProfileModal
      profile={{
        id: `${name}-${age}`,
        name,
        age,
        height,
        profession,
        community,
        location,
        photos,
        bio,
        interests,
        education,
        religion: community, // Using community as religion for now
        verified,
        premium,
      }}
      open={showProfileModal}
      onOpenChange={setShowProfileModal}
      onConnect={() => {
        setShowProfileModal(false)
        onConnect()
      }}
      onNotNow={() => {
        setShowProfileModal(false)
        onNotNow()
      }}
    />
    </>
  )
}