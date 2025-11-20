"use client"

import { useEffect } from "react"
import { MessageCircle, User, Search, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount"

interface QuickActionsProps {
  onOpenChat: () => void
  onOpenProfile: () => void
  onDiscover?: () => void
  onOpenActivity?: () => void
  activeTab?: string
  className?: string
}

export function QuickActions({ onOpenChat, onOpenProfile, onDiscover, onOpenActivity, activeTab, className }: QuickActionsProps) {
  const unreadCount = useUnreadMessageCount()
  
  // Debug log
  useEffect(() => {
    console.log('[QuickActions] Unread count:', unreadCount)
  }, [unreadCount])
  
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
              {/* Unread message badge for messages icon */}
              {tab.id === "messages" && unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white shadow-lg z-10">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}