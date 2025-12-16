"use client"

import { StaticBackground } from "@/components/discovery/static-background"

interface EventsScreenProps {
  onBack?: () => void
}

export function EventsScreen({ onBack }: EventsScreenProps) {
  return (
    <div className="flex flex-col h-full relative bg-[#0E0F12] min-h-screen">
      {/* Static Background */}
      <StaticBackground />
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#FFFFFF' }}>
            Events
          </h1>
          <p className="text-base font-medium max-w-md" style={{ color: '#A1A1AA' }}>
            Discover dating events happening around you
          </p>
        </div>
      </div>
    </div>
  )
}
