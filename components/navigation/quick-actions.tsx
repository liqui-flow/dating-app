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
          className="rounded-full px-4 py-5 shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
          onClick={onDiscover}
        >
          <Search className="mr-2 h-4 w-4" />
          Discover
        </Button>
      )}
      <Button
        variant="secondary"
        className="rounded-full px-4 py-5 shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
        onClick={onOpenChat}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Open Chat
      </Button>
      <Button
        variant="secondary"
        className="rounded-full px-4 py-5 shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
        onClick={onOpenProfile}
      >
        <User className="mr-2 h-4 w-4" />
        Profile
      </Button>
    </div>
  )
}