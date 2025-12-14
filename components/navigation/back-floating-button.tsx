"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BackFloatingButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <div className={cn("fixed bottom-4 left-4 z-50", className)}>
      <Button
        variant="secondary"
        className="group rounded-full px-5 py-5 text-sm font-semibold tracking-wide shadow-[0_4px_16px_rgba(0,0,0,0.1)] bg-white text-black border-2 border-black transition-all duration-200 hover:!bg-black/5 hover:-translate-y-0.5"
        onClick={onClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-colors" />
        Back
      </Button>
    </div>
  )
}