'use client'

import { useEffect, useState } from 'react'
import { Heart, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimationParticle {
  id: string
  x: number
  y: number
  rotation: number
  delay: number
  scale: number
}

interface SwipeAnimationsProps {
  show: boolean
  type: 'heart' | 'x'
  onComplete?: () => void
  hideOverlay?: boolean // New prop to hide the color overlay
}

export function SwipeAnimations({ show, type, onComplete, hideOverlay = false }: SwipeAnimationsProps) {
  const [particles, setParticles] = useState<AnimationParticle[]>([])

  useEffect(() => {
    if (show) {
      // Generate 3-5 particles with random positions and properties
      const count = Math.floor(Math.random() * 3) + 3 // 3-5 particles
      const newParticles: AnimationParticle[] = Array.from({ length: count }, (_, i) => ({
        id: `${type}-${Date.now()}-${i}`,
        x: (Math.random() - 0.5) * 100, // -50 to 50
        y: Math.random() * 30, // 0 to 30
        rotation: (Math.random() - 0.5) * 60, // -30 to 30 degrees
        delay: i * 0.08, // Staggered animation
        scale: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
      }))
      
      setParticles(newParticles)

      // Clear particles after animation completes
      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [show, type, onComplete])

  if (!show || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Full card overlay with color tint - conditionally rendered */}
      {!hideOverlay && (
        <div 
          className={cn(
            "absolute inset-0 animate-card-flash",
            type === 'heart' 
              ? "bg-gradient-to-br from-pink-600/25 via-pink-500/15 to-transparent" 
              : "bg-gradient-to-br from-rose-500/20 via-red-400/10 to-transparent"
          )}
        />
      )}
      
      {/* Particles scattered across the card */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-swipe-burst"
          style={{
            animationDelay: `${particle.delay}s`,
            '--particle-x': `${particle.x * 2}px`,
            '--particle-y': `${particle.y}px`,
            '--particle-rotation': `${particle.rotation}deg`,
            '--particle-scale': particle.scale,
            left: '50%',
            top: '50%',
          } as React.CSSProperties}
        >
          {type === 'heart' ? (
            <Heart 
              className="w-16 h-16 text-pink-600 fill-pink-600 drop-shadow-lg" 
              strokeWidth={2}
            />
          ) : (
            <X 
              className="w-16 h-16 text-rose-500 drop-shadow-lg" 
              strokeWidth={3}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Hook to trigger animations
export function useSwipeAnimation() {
  const [animation, setAnimation] = useState<{ show: boolean; type: 'heart' | 'x' }>({
    show: false,
    type: 'heart',
  })

  const showHeartBurst = () => {
    setAnimation({ show: true, type: 'heart' })
  }

  const showXBurst = () => {
    setAnimation({ show: true, type: 'x' })
  }

  const hideAnimation = () => {
    setAnimation({ show: false, type: 'heart' })
  }

  return {
    animation,
    showHeartBurst,
    showXBurst,
    hideAnimation,
  }
}
