"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
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
  const { animation, showHeartBurst, showXBurst, hideAnimation } = useSwipeAnimation()

  // Framer Motion values for smooth dragging
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Transform motion values to rotation and opacity
  const rotate = useTransform(x, [-300, 300], [-30, 30])
  const likeOpacity = useTransform(x, [0, 120], [0, 1])
  const passOpacity = useTransform(x, [-120, 0], [1, 0])

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
    const threshold = 120
    const velocity = info.velocity.x
    
    if (info.offset.x > threshold || velocity > 500) {
      // Like - trigger heart animation and swipe out
      showHeartBurst()
      animate(x, 1000, { duration: 0.4, ease: "easeInOut" })
      setTimeout(() => {
        onLike()
      }, 400)
    } else if (info.offset.x < -threshold || velocity < -500) {
      // Pass - trigger X animation and swipe out
      showXBurst()
      animate(x, -1000, { duration: 0.4, ease: "easeInOut" })
      setTimeout(() => {
        onPass()
      }, 400)
    } else {
      // Reset card position smoothly with spring animation
      animate(x, 0, { duration: 0.6, ease: "easeOut" })
      animate(y, 0, { duration: 0.6, ease: "easeOut" })
    }
  }

  return (
    <>
      {/* Swipe Animations */}
      <SwipeAnimations 
        show={animation.show} 
        type={animation.type} 
        onComplete={hideAnimation}
      />

      <motion.div
        className={cn(
          "w-full max-w-sm h-[60vh] md:h-[480px] overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none",
          "rounded-3xl",
          "relative",
          // 3D floating effect
          "transform-gpu perspective-1000",
          // Enhanced shadows for realistic depth
          stackIndex === 0 && "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_10px_30px_-10px_rgba(0,0,0,0.3)]",
          stackIndex === 1 && "shadow-[0_15px_45px_-12px_rgba(0,0,0,0.35),0_8px_25px_-8px_rgba(0,0,0,0.25)]",
          stackIndex === 2 && "shadow-[0_12px_35px_-10px_rgba(0,0,0,0.3),0_6px_20px_-6px_rgba(0,0,0,0.2)]",
          stackIndex > 2 && "shadow-[0_8px_25px_-8px_rgba(0,0,0,0.25),0_4px_15px_-4px_rgba(0,0,0,0.15)]",
          // Hover effect for top card
          stackIndex === 0 && "hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5),0_15px_40px_-10px_rgba(0,0,0,0.35)] hover:scale-[1.02] transition-all duration-300",
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
          background: "transparent",
        }}
        drag={stackIndex === 0 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onClick={handlePhotoClick}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
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
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
          {profile.verified && <Badge className="bg-primary text-primary-foreground">Verified</Badge>}
          {profile.premium && <Badge className="bg-secondary text-secondary-foreground">Premium</Badge>}
        </div>
      )}

      {/* Like/Pass hint while dragging */}
      {stackIndex === 0 && (
        <>
          <motion.div
            className="absolute top-6 left-6 text-2xl font-extrabold tracking-wider text-emerald-400"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 text-2xl font-extrabold tracking-wider text-rose-400"
            style={{ opacity: passOpacity }}
          >
            NOPE
          </motion.div>
        </>
      )}

      {/* Bottom glassmorphic bar with name/age and info button - Enhanced 3D */}
      {stackIndex === 0 && (
        <div
          className={cn(
            "absolute left-4 right-4 bottom-4 z-20",
            "rounded-2xl p-4 flex items-center justify-between",
            "bg-white/[0.15] border border-white/30",
            "backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.15]",
            // Enhanced shadow for floating effect
            "shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]",
            // Subtle inner glow
            "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
            "relative overflow-hidden",
          )}
        >
          <div className="min-w-0 relative z-10">
            <h2 className="text-white text-xl font-bold truncate drop-shadow-lg">
              {profile.name}, {profile.age}
            </h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full w-9 h-9 p-0 shadow-lg bg-white/25 border border-white/40 backdrop-blur-xl hover:bg-white/35 hover:scale-110 transition-all duration-200 relative z-10"
            onClick={(e) => {
              e.stopPropagation()
              setShowInfo((v) => !v)
            }}
          >
            <Info className="w-4 h-4 text-white drop-shadow" />
          </Button>
        </div>
      )}

      {/* Expandable glass info panel */}
      {stackIndex === 0 && (
        <div
          className={cn(
            "absolute left-4 right-4 z-10 overflow-hidden transition-all duration-300",
            showInfo ? "bottom-24" : "bottom-24 max-h-0 opacity-0",
          )}
          style={{ opacity: showInfo ? 1 : 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl bg-white/[0.15] border border-white/30 backdrop-blur-xl p-5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-base">About</div>
                <div className="text-white/90 line-clamp-5 leading-relaxed">{profile.bio}</div>
                <div className="pt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white/15 border-white/40 text-white shadow-sm backdrop-blur-sm">
                    {profile.occupation}
                  </Badge>
                  <Badge variant="outline" className="bg-white/15 border-white/40 text-white shadow-sm backdrop-blur-sm">
                    {profile.education}
                  </Badge>
                  {profile.interests.slice(0, 5).map((interest) => (
                    <Badge key={interest} variant="outline" className="bg-white/15 border-white/40 text-white shadow-sm backdrop-blur-sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/25 font-medium"
                    onClick={(e) => {
                      e.stopPropagation()
                      onProfileClick()
                    }}
                  >
                    View full profile
                  </Button>
                </div>
              </div>
            </div>
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
    </>
  )
}
