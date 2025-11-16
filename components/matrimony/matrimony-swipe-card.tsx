"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Info, MoreHorizontal, MapPin, Briefcase, GraduationCap, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { SwipeAnimations, useSwipeAnimation } from "../discovery/swipe-animations"
import { MatrimonyProfileModal } from "./matrimony-profile-modal"

interface MatrimonySwipeCardProps {
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
}

export function MatrimonySwipeCard({
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
}: MatrimonySwipeCardProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const { animation, showHeartBurst, showXBurst, hideAnimation } = useSwipeAnimation()
  
  // Motion value for 3D rotation
  const rotateY = useMotionValue(0)

  // Framer Motion values for smooth dragging
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Transform motion values to rotation only (no opacity overlays)
  const rotate = useTransform(x, [-300, 300], [-30, 30])

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
    const threshold = 120
    const velocity = info.velocity.x
    
    if (info.offset.x > threshold || velocity > 500) {
      // Connect - trigger heart animation and swipe out
      showHeartBurst()
      animate(x, 1000, { duration: 0.4, ease: "easeInOut" })
      setTimeout(() => {
        onConnect()
      }, 400)
    } else if (info.offset.x < -threshold || velocity < -500) {
      // Not Now - trigger X animation and swipe out
      showXBurst()
      animate(x, -1000, { duration: 0.4, ease: "easeInOut" })
      setTimeout(() => {
        onNotNow()
      }, 400)
    } else {
      // Reset card position smoothly with spring animation
      animate(x, 0, { duration: 0.6, ease: "easeOut" })
      animate(y, 0, { duration: 0.6, ease: "easeOut" })
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
          "w-full max-w-sm h-[60vh] md:h-[480px] cursor-grab active:cursor-grabbing select-none touch-none",
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
          scale: depthStyles.scale,
          translateY: depthStyles.translateY,
          translateX: depthStyles.translateX,
          zIndex: depthStyles.zIndex,
          opacity: depthStyles.opacity,
        }}
        drag={stackIndex === 0 && !isFlipped ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
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

      {/* Top-right menu dots */}
      {stackIndex === 0 && (
        <div className="absolute top-4 right-4 z-20">
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
              // Trigger X animation and swipe out
              showXBurst()
              animate(x, -1000, { duration: 0.4, ease: "easeInOut" })
              setTimeout(() => {
                onNotNow()
              }, 400)
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
                "absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden rounded-3xl",
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
                  src={photos[currentPhotoIndex] || "/placeholder.svg"}
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
                  "w-8 h-8 p-0 rounded-full",
                  "bg-white/20 backdrop-blur-md border border-white/30",
                  "hover:bg-white/30 hover:scale-110",
                  "transition-all duration-200",
                  "shadow-lg"
                )}
                onClick={handleInfoClick}
                aria-label="Close profile"
              >
                <X className="w-4 h-4 text-white drop-shadow-sm" />
              </Button>

              {/* Profile Content */}
              <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-full">
                {/* Header */}
                <div className="space-y-2 pt-12">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {name}, {age}
                    {height && <span className="text-xl sm:text-2xl font-normal text-white/80"> • {height}</span>}
                  </h1>
                  {location && (
                    <div className="flex items-center space-x-2 text-white/90">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm sm:text-base">{location}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {bio && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white text-sm sm:text-base">About</h3>
                    <p className="text-white/90 text-sm sm:text-base leading-relaxed">{bio}</p>
                  </div>
                )}

                {/* Details Grid */}
                {highlightItems.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {highlightItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={item.label}
                          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-white/60 mb-1">{item.label}</p>
                          <div className="flex items-center space-x-1">
                            <Icon className="w-3 h-3 text-white/60" />
                            <p className="text-sm font-semibold text-white leading-tight">{item.value}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Interests */}
                {interests && interests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white text-sm sm:text-base">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
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
                      setTimeout(() => onNotNow(), 300)
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
                      setTimeout(() => onConnect(), 300)
                    }}
                  >
                    <Check className="w-6 h-6 sm:w-8 sm:h-8" />
                  </Button>
                </div>
              </div>
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