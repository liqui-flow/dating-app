"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BackFloatingButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <div className={cn("fixed bottom-4 left-4 z-50", className)}>
      <Button
        variant="secondary"
        className="rounded-full px-4 py-5 shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
        onClick={onClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  )
}