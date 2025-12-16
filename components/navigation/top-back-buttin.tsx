"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopBackButtonProps {
  onBack: () => void
  className?: string
}

export function TopBackButton({ onBack, className }: TopBackButtonProps) {
  return (
    <div className={cn("fixed top-3 left-3 z-50", className)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Back"
        onClick={onBack}
        className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-full"
        style={{ borderRadius: 9999 }}
      >
        <ChevronLeft className="w-5 h-5" style={{ color: '#FFFFFF' }} />
      </Button>
    </div>
  )
}