"use client"

import { MessageCircle, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuickActionsProps {
  onOpenChat: () => void
  onOpenProfile: () => void
  onDiscover?: () => void
  className?: string
}

export function QuickActions({ onOpenChat, onOpenProfile, onDiscover, className }: QuickActionsProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3",
        className,
      )}
    >
      {onDiscover && (
        <Button
          variant="secondary"
          className="group rounded-full px-5 py-5 text-sm font-medium tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.4)] bg-white/10 text-white border border-white/20 backdrop-blur-xl transition-all duration-200 hover:!bg-white hover:!text-black hover:!border-black hover:-translate-y-0.5"
          onClick={onDiscover}
        >
          <Search className="mr-2 h-4 w-4 transition-colors group-hover:text-black" />
          Discover
        </Button>
      )}
      <Button
        variant="secondary"
        className="group rounded-full px-5 py-5 text-sm font-medium tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.4)] bg-white/10 text-white border border-white/20 backdrop-blur-xl transition-all duration-200 hover:!bg-white hover:!text-black hover:!border-black hover:-translate-y-0.5"
        onClick={onOpenChat}
      >
        <MessageCircle className="mr-2 h-4 w-4 transition-colors group-hover:text-black" />
        Open Chat
      </Button>
      <Button
        variant="secondary"
        className="group rounded-full px-5 py-5 text-sm font-medium tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.4)] bg-white/10 text-white border border-white/20 backdrop-blur-xl transition-all duration-200 hover:!bg-white hover:!text-black hover:!border-black hover:-translate-y-0.5"
        onClick={onOpenProfile}
      >
        <User className="mr-2 h-4 w-4 transition-colors group-hover:text-black" />
        Profile
      </Button>
    </div>
  )
}