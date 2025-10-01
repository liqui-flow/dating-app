"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Search, MessageCircle, User, Compass } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: TabItem[] = [
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: User },
]

interface BottomTabsProps {
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

export function BottomTabs({ activeTab = "discover", onTabChange }: BottomTabsProps) {
  const [currentTab, setCurrentTab] = useState(activeTab)

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId)
    onTabChange?.(tabId)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-current")} />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}