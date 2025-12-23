"use client"

import { useEffect } from "react"
import { MessageCircle, User, Search, Bell, Star, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount"
import { useUnreadActivityCount } from "@/hooks/useUnreadActivityCount"

interface QuickActionsProps {
  onOpenChat: () => void
  onOpenProfile: () => void
  onDiscover?: () => void
  onOpenActivity?: () => void
  onOpenEvents?: () => void
  onOpenShortlist?: () => void
  showShortlist?: boolean
  activeTab?: string
  className?: string
  mode?: 'dating' | 'matrimony'
}

export function QuickActions({
  onOpenChat,
  onOpenProfile,
  onDiscover,
  onOpenActivity,
  onOpenEvents,
  onOpenShortlist,
  showShortlist = false,
  activeTab,
  className,
  mode = 'dating',
}: QuickActionsProps) {
  const unreadCount = useUnreadMessageCount()
  const { unreadCount: activityUnreadCount } = useUnreadActivityCount(mode)
  const isMatrimony = mode === 'matrimony'
  
  // Debug log
  useEffect(() => {
    console.log('[QuickActions] Unread count:', unreadCount)
    console.log('[QuickActions] Activity unread count:', activityUnreadCount)
  }, [unreadCount, activityUnreadCount])
  
  const tabs = [
    { id: "discover", icon: Search, onClick: onDiscover, show: !!onDiscover },
    { id: "shortlist", icon: Star, onClick: onOpenShortlist, show: showShortlist && !!onOpenShortlist },
    { id: "messages", icon: MessageCircle, onClick: onOpenChat, show: true },
    { id: "activity", icon: Bell, onClick: onOpenActivity, show: !!onOpenActivity },
    { id: "events", icon: Calendar, onClick: onOpenEvents, show: mode === 'dating' && !!onOpenEvents },
    { id: "profile", icon: User, onClick: onOpenProfile, show: true },
  ].filter(tab => tab.show)

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        className,
      )}
    >
      <div className={cn(
        "flex items-center gap-4 px-8 py-3 rounded-3xl backdrop-blur-xl border shadow-[0_8px_24px_rgba(0,0,0,0.3)]",
        isMatrimony 
          ? "bg-white border-[#E5E5E5] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          : "bg-white/10 border-white/20"
      )}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={cn(
                "relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-150 ease-in-out",
                isMatrimony
                  ? isActive
                    ? ""
                    : "hover:bg-black/4 cursor-pointer"
                  : isActive 
                    ? "bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg" 
                    : "hover:bg-white/10"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center",
                isMatrimony && isActive && "p-2 rounded-full bg-black/8 backdrop-blur-[8px] shadow-[0_4px_10px_rgba(0,0,0,0.08)]"
              )}>
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-150 ease-in-out"
                  )} 
                  stroke={isMatrimony ? (isActive ? "#000000" : "rgba(0,0,0,0.75)") : "#FFFFFF"}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill="none"
                  style={isMatrimony ? {
                    color: isActive ? '#000000' : 'rgba(0,0,0,0.75)',
                    stroke: isActive ? '#000000' : 'rgba(0,0,0,0.75)',
                    fill: 'none',
                    opacity: isActive ? 1 : 0.75
                  } : {
                    color: '#FFFFFF',
                    stroke: '#FFFFFF',
                    fill: 'none'
                  }}
                />
                {!isMatrimony && isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                )}
                {/* Unread message badge for messages icon */}
                {tab.id === "messages" && unreadCount > 0 && (
                  <div className={cn(
                    "absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center px-1 rounded-full bg-[#97011A] backdrop-blur-md border text-white text-xs font-bold shadow-md z-10",
                    isMatrimony ? "border-white" : "border-[#97011A]/50"
                  )} style={{ color: '#FFFFFF' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
                {/* Unread activity badge for activity icon */}
                {tab.id === "activity" && activityUnreadCount > 0 && (
                  <div className={cn(
                    "absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center px-1 rounded-full bg-[#97011A] backdrop-blur-md border text-white text-xs font-bold shadow-md z-10",
                    isMatrimony ? "border-white" : "border-[#97011A]/50"
                  )} style={{ color: '#FFFFFF' }}>
                    {activityUnreadCount > 99 ? '99+' : activityUnreadCount}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}