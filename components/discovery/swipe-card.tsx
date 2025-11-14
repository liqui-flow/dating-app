"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion"
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
  
  // Transform motion values to rotation
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
          "w-full max-w-xs sm:max-w-sm h-[55vh] sm:h-[60vh] md:h-[480px] overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none",
          "rounded-2xl sm:rounded-3xl",
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
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col space-y-1 sm:space-y-2 z-20">
          {profile.premium && <Badge className="bg-[#4A0E0E] text-white text-xs px-2 py-1">Premium</Badge>}
        </div>
      )}


      {/* Bottom glassmorphic bar with name/age and info button - Enhanced 3D */}
      {stackIndex === 0 && (
        <div
          className={cn(
            "absolute left-2 right-2 sm:left-4 sm:right-4 top-95 z-10 w-11/12",
            "rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-between",
            "bg-white/[0.15] border border-white/30",
            "backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.15]",
            // Enhanced shadow for floating effect
            "shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]",
            // Subtle inner glow
            "before:absolute before:inset-0 before:rounded-xl sm:before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
            "relative overflow-hidden",
          )}
        >
          <div className="min-w-0 relative z-10">
            <h2 className="text-white text-lg sm:text-xl font-bold truncate drop-shadow-lg">
              {profile.name}, {profile.age}
            </h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            className={cn(
              "group rounded-full w-8 h-8 sm:w-9 sm:h-9 p-0 shadow-lg border border-white/40 backdrop-blur-xl hover:bg-white/40 hover:scale-110 transition-all duration-200 relative z-10 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/70 focus-visible:ring-offset-transparent",
              showInfo ? "bg-white text-slate-900 border-white/80 shadow-[0_0_25px_rgba(255,255,255,0.45)]" : "bg-white/25",
            )}
            onClick={(e) => {
              e.stopPropagation()
              setShowInfo((v) => !v)
            }}
            aria-pressed={showInfo}
            aria-label="Toggle profile details"
          >
            <motion.span
              initial={false}
              animate={{ rotate: showInfo ? 20 : 0, scale: showInfo ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 15 }}
              className="flex items-center justify-center w-full h-full"
            >
              <Info
                className={cn(
                  "w-3 h-3 sm:w-4 sm:h-4 drop-shadow transition-colors duration-200",
                  showInfo ? "text-slate-900" : "text-white",
                )}
              />
            </motion.span>
            <span className="sr-only">{showInfo ? "Hide quick profile info" : "Show quick profile info"}</span>
          </Button>
        </div>
      )}

      {/* Expandable glass info panel */}
      {stackIndex === 0 && (
        <AnimatePresence>
          {showInfo && (
            <motion.div
              key="profile-info-panel"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="absolute left-2 right-2 sm:left-4 sm:right-4 bottom-24 sm:bottom-28 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl bg-white/[0.18] border border-white/35 backdrop-blur-2xl p-4 sm:p-6 text-white shadow-[0_15px_45px_rgba(0,0,0,0.45)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent opacity-70 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)] pointer-events-none" />
                <div className="relative z-10 space-y-4 text-sm sm:text-base">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">About</p>
                      <p className="text-base sm:text-lg font-semibold text-white drop-shadow">{profile.name}</p>
                    </div>
                    {profile.distance && (
                      <Badge className="bg-white/25 text-white border border-white/40 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide">
                        {profile.distance}
                      </Badge>
                    )}
                  </div>

                  <p className="text-white/90 leading-relaxed text-xs sm:text-sm line-clamp-5">{profile.bio}</p>

                  {highlightItems.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-left">
                      {highlightItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 sm:px-4 sm:py-3 shadow-inner shadow-white/5"
                        >
                          <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mb-1">{item.label}</p>
                          <p className="text-sm font-semibold text-white/95 leading-tight">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {visibleInterests.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">Interests</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {visibleInterests.map((interest) => (
                          <span
                            key={interest}
                            className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                          >
                            {interest}
                          </span>
                        ))}
                        {remainingInterestCount > 0 && (
                          <span className="rounded-full bg-white/25 text-white font-semibold text-xs px-3 py-1">
                            +{remainingInterestCount} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white font-semibold text-xs sm:text-sm hover:bg-white/25 hover:text-white/95 transition-colors"
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
            </motion.div>
          )}
        </AnimatePresence>
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
