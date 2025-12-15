"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart, Search, MessageCircle, User, Compass, Bell, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount"
import { useUnreadActivityCount } from "@/hooks/useUnreadActivityCount"

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const allTabs: TabItem[] = [
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "activity", label: "Activity", icon: Bell },
  { id: "events", label: "Events", icon: Calendar },
  { id: "profile", label: "Profile", icon: User },
]

interface BottomTabsProps {
  activeTab?: string
  onTabChange?: (tabId: string) => void
  mode?: 'dating' | 'matrimony'
}

export function BottomTabs({ activeTab = "discover", onTabChange, mode = 'dating' }: BottomTabsProps) {
  const [currentTab, setCurrentTab] = useState(activeTab)
  const unreadCount = useUnreadMessageCount()
  const { unreadCount: activityUnreadCount } = useUnreadActivityCount(mode)

  // Sync currentTab with activeTab prop
  useEffect(() => {
    setCurrentTab(activeTab)
  }, [activeTab])

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId)
    onTabChange?.(tabId)
  }

  // Filter tabs based on mode: Events only shows in Dating mode
  const tabs = allTabs.filter(tab => {
    if (tab.id === "events" && mode !== 'dating') {
      return false
    }
    return true
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/12 z-50 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors",
                "hover:bg-black/5 rounded-lg",
                isActive ? "text-[#97011A]" : "text-black hover:text-black/80",
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6 mb-1 transition-all", isActive && "fill-current stroke-[2.5]")} />
                {/* Unread message badge for messages icon */}
                {tab.id === "messages" && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-[#97011A] text-white text-[10px] font-bold border-2 border-white shadow-md z-10">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
                {/* Unread activity badge for activity icon */}
                {tab.id === "activity" && activityUnreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-[#97011A] text-white text-[10px] font-bold border-2 border-white shadow-md z-10">
                    {activityUnreadCount > 99 ? '99+' : activityUnreadCount}
                  </div>
                )}
              </div>
              <span className={cn("text-xs font-semibold truncate", isActive && "text-[#97011A]")}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}