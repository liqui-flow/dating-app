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
  const isMatrimony = mode === 'matrimony'
  
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
    <>
      {/* Only apply white icon styles for Dating mode */}
      {!isMatrimony && (
        <style dangerouslySetInnerHTML={{__html: `
          nav[data-bottom-nav] svg,
          nav[data-bottom-nav] svg path,
          nav[data-bottom-nav] svg circle,
          nav[data-bottom-nav] svg line,
          nav[data-bottom-nav] svg polyline,
          nav[data-bottom-nav] svg polygon {
            stroke: #FFFFFF !important;
            fill: none !important;
            color: #FFFFFF !important;
          }
          nav[data-bottom-nav] button svg {
            stroke: #FFFFFF !important;
            fill: none !important;
            color: #FFFFFF !important;
          }
        `}} />
      )}
      <nav 
        data-bottom-nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t z-50",
          isMatrimony 
            ? "bg-white border-[#E5E5E5] shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
            : "bg-white/10 border-white/20 shadow-[0_-2px_8px_rgba(0,0,0,0.3)]"
        )}
      >
        <div className="flex items-center justify-around py-2 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-all duration-150 ease-in-out",
                  isMatrimony 
                    ? isActive 
                      ? "" 
                      : "hover:bg-black/4 cursor-pointer"
                    : "hover:bg-white/10 rounded-lg",
                  !isMatrimony && isActive && "bg-white/20 rounded-lg",
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center",
                  isMatrimony && isActive && "p-2 rounded-full bg-black/8 backdrop-blur-[8px] shadow-[0_4px_10px_rgba(0,0,0,0.08)]"
                )}>
                  <Icon 
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 mb-1 transition-all duration-150 ease-in-out",
                      isActive && "stroke-[2.5]"
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
                  {/* Unread message badge for messages icon */}
                  {tab.id === "messages" && unreadCount > 0 && (
                    <div className={cn(
                      "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-[#97011A] text-white text-[10px] font-bold shadow-md z-10",
                      isMatrimony ? "border-2 border-white" : "border-2 border-white"
                    )}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                  {/* Unread activity badge for activity icon */}
                  {tab.id === "activity" && activityUnreadCount > 0 && (
                    <div className={cn(
                      "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-[#97011A] text-white text-[10px] font-bold shadow-md z-10",
                      isMatrimony ? "border-2 border-white" : "border-2 border-white"
                    )}>
                      {activityUnreadCount > 99 ? '99+' : activityUnreadCount}
                    </div>
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs font-semibold truncate transition-colors duration-150 ease-in-out",
                    isMatrimony 
                      ? isActive 
                        ? "text-black" 
                        : "text-black/75"
                      : "text-white"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}