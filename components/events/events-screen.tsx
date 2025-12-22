"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar } from "lucide-react"
import { StaticBackground } from "@/components/discovery/static-background"

interface EventsScreenProps {
  onBack?: () => void
}

export function EventsScreen({ onBack }: EventsScreenProps) {
  return (
    <div className="flex flex-col h-full relative bg-[#0E0F12] min-h-screen">
      {/* Static Background */}
      <StaticBackground />
      
      {/* Header with Back Button */}
      <div className="flex-shrink-0 p-4 border-b border-white/20 bg-[#14161B]/50 backdrop-blur-xl shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-white/10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20" 
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: '#FFFFFF' }} />
              </Button>
            )}
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Events</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" style={{ color: '#A1A1AA' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>No events yet</h3>
          <p className="text-sm" style={{ color: '#A1A1AA' }}>
            Discover dating events happening around you
          </p>
        </div>
      </div>
    </div>
  )
}
