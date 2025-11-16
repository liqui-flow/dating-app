"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, MapPin, X, Briefcase, GraduationCap, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { SwipeAnimations, useSwipeAnimation } from "./swipe-animations"

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
  const { animation, showHeartBurst, showXBurst, hideAnimation } = useSwipeAnimation()
  
  // Motion value for 3D rotation
  const rotateY = useMotionValue(0)

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

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (stackIndex === 0) {
      const newFlippedState = !isFlipped
      setIsFlipped(newFlippedState)
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
          "w-full max-w-xs sm:max-w-sm h-[55vh] sm:h-[60vh] md:h-[480px] cursor-grab active:cursor-grabbing select-none touch-none",
          "relative",
          // 3D perspective container
          "perspective-[1200px]",
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
          {profile.premium && <Badge className="bg-[#4A0E0E] text-white text-xs px-2 py-1">Premium</Badge>}
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
              {profile.name}, {profile.age}
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
              "bg-white/20 backdrop-blur-md border border-white/30",
              "hover:bg-white/30 hover:scale-110",
              "transition-all duration-200",
              "shadow-lg"
            )}
            onClick={handleInfoClick}
            aria-label="View full profile"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
          </Button>
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
                "absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden rounded-2xl sm:rounded-3xl",
                "backface-hidden"
              )}
              style={{
                opacity: backOpacity,
                rotateY: 180,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Background photo - same position as front */}
              <div className="absolute inset-0">
                <img
                  src={profile.photos[currentPhotoIndex] || "/placeholder.svg"}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: "center" }}
                />
                <div className="absolute inset-0 bg-black/70" />
              </div>

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className={cn(
                  "absolute top-4 right-4 z-30",
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

              {/* Profile Content */}
              <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full">
                {/* Header */}
                <div className="space-y-2 pt-12">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {profile.name}, {profile.age}
                  </h1>
                  {profile.location && (
                    <div className="flex items-center space-x-2 text-white/90">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm sm:text-base">{profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white text-sm sm:text-base">About</h3>
                    <p className="text-white/90 text-sm sm:text-base leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Details Grid */}
                {highlightItems.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {highlightItems.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm"
                      >
                        <p className="text-[10px] uppercase tracking-wider text-white/60 mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-white leading-tight">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interests */}
                {profile.interests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white text-sm sm:text-base">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <Badge
                          key={interest}
                          className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white/90"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-4 pt-4 pb-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleInfoClick(e)
                      setTimeout(() => onPass(), 300)
                    }}
                  >
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                  </Button>

                  <Button
                    size="lg"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0 text-sm sm:text-base"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleInfoClick(e)
                      setTimeout(() => onLike(), 300)
                    }}
                  >
                    Like
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}
