"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
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
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showInfo, setShowInfo] = useState(false)
  const startingPoint = useRef<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const { animation, showHeartBurst, showXBurst, hideAnimation } = useSwipeAnimation()

  const rotation = dragOffset.x * 0.06
  const likeOpacity = Math.max(0, Math.min(1, dragOffset.x / 120))
  const passOpacity = Math.max(0, Math.min(1, -dragOffset.x / 120))

  const depthStyles = useMemo(() => {
    // Visual stacking for cards under the top card
    const scale = 1 - stackIndex * 0.05
    const translateY = stackIndex * 16
    const opacity = Math.max(0, 1 - stackIndex * 0.35)
    return { scale, translateY, opacity, zIndex: 30 - stackIndex }
  }, [stackIndex])

  const handlePhotoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
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

  // Gesture handlers (mouse + touch)
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const onPointerDown = (e: PointerEvent) => {
      startingPoint.current = { x: e.clientX, y: e.clientY }
      setIsDragging(true)
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !startingPoint.current) return
      const dx = e.clientX - startingPoint.current.x
      const dy = e.clientY - startingPoint.current.y
      setDragOffset({ x: dx, y: dy })
    }
    const onPointerUp = () => {
      if (!isDragging) return
      const threshold = 120
      if (dragOffset.x > threshold) {
        // Like - trigger heart animation
        showHeartBurst()
        setTimeout(() => {
          onLike()
        }, 300) // Delay to show animation
      } else if (dragOffset.x < -threshold) {
        // Pass - trigger X animation
        showXBurst()
        setTimeout(() => {
          onPass()
        }, 300) // Delay to show animation
      }
      setIsDragging(false)
      setDragOffset({ x: 0, y: 0 })
    }

    el.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)

    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
  }, [isDragging, dragOffset.x, dragOffset.y, onLike, onPass])

  return (
    <>
      {/* Swipe Animations */}
      <SwipeAnimations 
        show={animation.show} 
        type={animation.type} 
        onComplete={hideAnimation}
      />

      <Card
        ref={cardRef as any}
        className={cn(
          "w-full max-w-sm h-[60vh] md:h-[480px] overflow-hidden cursor-grab active:cursor-grabbing select-none",
          "rounded-3xl",
          "relative",
          // 3D floating effect
          "transform-gpu perspective-1000",
          // Elevated shadows for depth
          stackIndex === 0 && "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_10px_30px_-10px_rgba(0,0,0,0.3)]",
          stackIndex === 1 && "shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)]",
          stackIndex > 1 && "shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)]",
          // Hover effect for top card
          stackIndex === 0 && "hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5),0_15px_40px_-10px_rgba(0,0,0,0.35)] hover:scale-[1.02] transition-all duration-300",
        )}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${depthStyles.scale}) translateY(${depthStyles.translateY}px) translateZ(${stackIndex === 0 ? '20px' : '0px'})` as any,
          zIndex: depthStyles.zIndex,
          opacity: depthStyles.opacity,
          transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease, box-shadow 300ms ease",
          background: "transparent",
          transformStyle: "preserve-3d",
        }}
        onClick={handlePhotoClick}
      >
      {/* Background photo fills the card */}
      <img
        src={profile.photos[currentPhotoIndex] || "/placeholder.svg"}
        alt=""
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          stackIndex > 0 && "blur-[3px] brightness-70 contrast-85",
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
          <div
            className="absolute top-6 left-6 text-2xl font-extrabold tracking-wider text-emerald-400"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </div>
          <div
            className="absolute top-6 right-6 text-2xl font-extrabold tracking-wider text-rose-400"
            style={{ opacity: passOpacity }}
          >
            NOPE
          </div>
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

      {/* Dim overlay for behind cards to hide details */}
      {stackIndex > 0 && <div className="absolute inset-0 bg-black/30" />}
    </Card>
    </>
  )
}
