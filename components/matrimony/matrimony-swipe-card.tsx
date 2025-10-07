"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { SwipeAnimations, useSwipeAnimation } from "../discovery/swipe-animations"

interface MatrimonySwipeCardProps {
  name: string
  age: number
  height?: string
  profession: string
  community?: string
  location: string
  avatar: string
  verified?: boolean
  onConnect: () => void
  onNotNow: () => void
}

export function MatrimonySwipeCard({
  name,
  age,
  height,
  profession,
  community,
  location,
  avatar,
  verified,
  onConnect,
  onNotNow,
}: MatrimonySwipeCardProps) {
  const { animation, showHeartBurst, showXBurst, hideAnimation } = useSwipeAnimation()

  const handleConnect = () => {
    showHeartBurst()
    setTimeout(() => {
      onConnect()
    }, 300)
  }

  const handleNotNow = () => {
    showXBurst()
    setTimeout(() => {
      onNotNow()
    }, 300)
  }

  return (
    <>
      {/* Swipe Animations */}
      <SwipeAnimations 
        show={animation.show} 
        type={animation.type} 
        onComplete={hideAnimation}
      />

      <Card className="relative w-full max-w-sm h-[60vh] md:h-[480px] overflow-hidden rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5),0_15px_40px_-10px_rgba(0,0,0,0.35)] hover:scale-[1.02] transition-all duration-300 transform-gpu">
      <img src={avatar} alt={name} className="absolute inset-0 w-full h-full object-cover" />
      
      {/* Frosted glass overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/60" />
      
      {/* Subtle frosted glass effect on top portion */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent backdrop-blur-[0.5px]" />

      {/* Top-right chips (placeholders) */}
      <div className="absolute top-3 right-3 space-y-2 text-white/90">
        <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">⋮</div>
        <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">10</div>
      </div>

      {/* Bottom overlay - Enhanced glassmorphic */}
      <div className="absolute inset-x-0 bottom-0 p-5 pt-10 bg-gradient-to-t from-black/85 via-black/60 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2 text-white">
          {verified && <Badge className="bg-emerald-500 text-white shadow-lg">✓</Badge>}
          <h3 className="text-2xl font-bold drop-shadow-lg">{name}</h3>
        </div>
        <div className="mt-2 text-sm text-white/95 flex items-center gap-3 font-medium">
          <span>{age} yrs{height ? `, ${height}` : ""}</span>
        </div>
        <div className="mt-1.5 text-sm text-white/90 truncate">
          {profession}
        </div>
        <div className="mt-1 text-sm text-white/85 truncate">
          {community ? `${community} · ` : ""}{location}
        </div>

        {/* Action row - Enhanced 3D buttons */}
        <div className="mt-4 flex items-center gap-3">
          <Button 
            onClick={handleNotNow} 
            variant="outline" 
            className="flex-1 bg-white/15 border-white/40 text-white hover:bg-white/25 shadow-lg backdrop-blur-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <X className="w-4 h-4 mr-1.5" /> Not Now
          </Button>
          <Button 
            onClick={handleConnect} 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Check className="w-4 h-4 mr-1.5" /> Connect
          </Button>
        </div>
      </div>
    </Card>
    </>
  )
}