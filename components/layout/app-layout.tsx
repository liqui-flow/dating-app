"use client"

import { cn } from "@/lib/utils"
import { Settings } from "lucide-react"

import type { ReactNode } from "react"
import { BottomTabs } from "@/components/navigation/bottom-tabs"

interface AppLayoutProps {
  children: ReactNode
  activeTab?: string
  onTabChange?: (tabId: string) => void
  showBottomTabs?: boolean
  onSettingsClick?: () => void
  showSettingsButton?: boolean
  currentScreen?: string
}

export function AppLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  showBottomTabs = true, 
  onSettingsClick,
  showSettingsButton = true,
  currentScreen
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Settings Icon - Only show on profile page */}
      {showSettingsButton && onSettingsClick && currentScreen === "profile" && (
        <div className="fixed top-4 right-4 z-40">
          <Settings 
            className="w-6 h-6 cursor-pointer text-foreground" 
            onClick={onSettingsClick}
          />
        </div>
      )}

      <main className={cn("pb-16 sm:pb-20", !showBottomTabs && "pb-0")}>{children}</main>

      {showBottomTabs && <BottomTabs activeTab={activeTab} onTabChange={onTabChange} />}
    </div>
  )
}
