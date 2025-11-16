"use client"

import { MessageCircle, User, Search, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickActionsProps {
  onOpenChat: () => void
  onOpenProfile: () => void
  onDiscover?: () => void
  onOpenActivity?: () => void
  activeTab?: string
  className?: string
}

export function QuickActions({ onOpenChat, onOpenProfile, onDiscover, onOpenActivity, activeTab, className }: QuickActionsProps) {
  const tabs = [
    { id: "discover", icon: Search, onClick: onDiscover, show: !!onDiscover },
    { id: "messages", icon: MessageCircle, onClick: onOpenChat, show: true },
    { id: "activity", icon: Bell, onClick: onOpenActivity, show: !!onOpenActivity },
    { id: "profile", icon: User, onClick: onOpenProfile, show: true },
  ].filter(tab => tab.show)

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        className,
      )}
    >
      <div className="flex items-center gap-4 px-8 py-3 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={cn(
                "relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200",
                isActive 
                  ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                  : "hover:bg-white/10"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-black" : "text-white"
                )} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              {isActive && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}