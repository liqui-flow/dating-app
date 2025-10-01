"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

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
        // Like
        onLike()
      } else if (dragOffset.x < -threshold) {
        // Pass
        onPass()
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
    <Card
      ref={cardRef as any}
      className={cn(
        "w-full max-w-sm h-[60vh] md:h-[480px] overflow-hidden cursor-grab active:cursor-grabbing select-none",
        "rounded-3xl shadow-xl",
        "relative",
      )}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${depthStyles.scale}) translateY(${depthStyles.translateY}px)` as any,
        zIndex: depthStyles.zIndex,
        opacity: depthStyles.opacity,
        transition: isDragging ? "none" : "transform 200ms ease, opacity 200ms ease",
        background: "transparent",
      }}
      onClick={handlePhotoClick}
    >
      {/* Background photo fills the card */}
      <img
        src={profile.photos[currentPhotoIndex] || "/placeholder.svg"}
        alt=""
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          stackIndex > 0 && "blur-[2px] brightness-75 contrast-90",
        )}
      />

      {/* Subtle gradient to improve text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/40" />

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

      {/* Bottom glassmorphic bar with name/age and info button */}
      {stackIndex === 0 && (
        <div
          className={cn(
            "absolute left-4 right-4 bottom-4 z-20",
            "rounded-2xl p-3 flex items-center justify-between",
            "bg-white/10 border border-white/20",
            "backdrop-blur-[14px] supports-[backdrop-filter]:bg-white/10",
            "shadow-lg",
          )}
        >
          <div className="min-w-0">
            <h2 className="text-white text-lg font-semibold truncate">
              {profile.name}, {profile.age}
            </h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full w-8 h-8 p-0 shadow-sm bg-white/20 border border-white/30 backdrop-blur-[14px] hover:bg-white/30"
            onClick={(e) => {
              e.stopPropagation()
              setShowInfo((v) => !v)
            }}
          >
            <Info className="w-4 h-4 text-white" />
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
          <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-[14px] p-4 text-white shadow-xl">
            <div className="space-y-2 text-sm">
              <div className="font-medium">About</div>
              <div className="text-white/90 line-clamp-5">{profile.bio}</div>
              <div className="pt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white/10 border-white/30 text-white/90">
                  {profile.occupation}
                </Badge>
                <Badge variant="outline" className="bg-white/10 border-white/30 text-white/90">
                  {profile.education}
                </Badge>
                {profile.interests.slice(0, 5).map((interest) => (
                  <Badge key={interest} variant="outline" className="bg-white/10 border-white/30 text-white/90">
                    {interest}
                  </Badge>
                ))}
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/90 hover:bg-white/20"
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
      )}

      {/* Dim overlay for behind cards to hide details */}
      {stackIndex > 0 && <div className="absolute inset-0 bg-black/30" />}
    </Card>
  )
}
