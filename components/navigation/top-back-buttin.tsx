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
        variant="outline"
        size="icon"
        aria-label="Back"
        onClick={onBack}
        style={{ borderRadius: 9999 }}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
    </div>
  )
}