"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BackFloatingButton({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <div className={cn("fixed bottom-4 left-4 z-50", className)}>
      <Button
        variant="secondary"
        className="group rounded-full px-5 py-5 text-sm font-medium tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.4)] bg-white/10 text-white border border-white/20 backdrop-blur-xl transition-all duration-200 hover:!bg-white hover:!text-black hover:!border-black hover:-translate-y-0.5"
        onClick={onClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-colors group-hover:text-black" />
        Back
      </Button>
    </div>
  )
}