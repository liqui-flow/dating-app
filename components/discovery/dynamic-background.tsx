"use client"

import { motion } from "framer-motion"
import { useDynamicBackground } from "@/hooks/useDynamicBackground"

interface DynamicBackgroundProps {
  imageUrl: string | null | undefined
  className?: string
}

export function DynamicBackground({ imageUrl, className = "" }: DynamicBackgroundProps) {
  const { gradient, isLoading } = useDynamicBackground({ imageUrl })

  return (
    <motion.div
      className={`fixed inset-0 -z-10 ${className}`}
      style={{
        background: gradient,
      }}
      animate={{
        background: gradient,
      }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smoother transitions
      }}
    >
      {/* Additional blur layer for iOS liquid glass effect */}
      <div className="absolute inset-0 backdrop-blur-3xl" />
      
      {/* Subtle overlay to ensure content remains visible */}
      <div className="absolute inset-0 bg-black/10" />
    </motion.div>
  )
}

