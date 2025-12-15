"use client"

import { StaticBackground } from "@/components/discovery/static-background"

interface EventsScreenProps {
  onBack?: () => void
}

export function EventsScreen({ onBack }: EventsScreenProps) {
  return (
    <div className="flex flex-col h-full relative bg-white">
      {/* Static Background */}
      <StaticBackground />
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-black mb-3">
            Events
          </h1>
          <p className="text-base text-black/75 font-medium max-w-md">
            Discover dating events happening around you
          </p>
        </div>
      </div>
    </div>
  )
}
