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
  mode?: 'dating' | 'matrimony'
}

export function AppLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  showBottomTabs = true, 
  onSettingsClick,
  showSettingsButton = true,
  currentScreen,
  mode = 'dating'
}: AppLayoutProps) {
  const isDiscoverScreen = currentScreen === "discover"
  const isMatrimony = mode === 'matrimony'
  
  return (
    <div className={cn(
      "min-h-screen", 
      isMatrimony ? "bg-white" : "bg-[#0E0F12]",
      isDiscoverScreen && "h-screen overflow-hidden"
    )}>
      {/* Settings Icon - Only show on profile page */}
      {showSettingsButton && onSettingsClick && currentScreen === "profile" && (
        <div className="fixed top-4 right-4 z-40">
          <Settings 
            className="w-6 h-6 cursor-pointer" 
            onClick={onSettingsClick}
            style={{ 
              color: isMatrimony ? '#000000' : '#FFFFFF', 
              stroke: isMatrimony ? '#000000' : '#FFFFFF', 
              fill: 'none' 
            }}
            strokeWidth={2}
          />
        </div>
      )}

      <main className={cn(
        "pb-16 sm:pb-20", 
        !showBottomTabs && "pb-0",
        isDiscoverScreen && "h-full overflow-hidden"
      )}>{children}</main>

      {showBottomTabs && <BottomTabs activeTab={activeTab} onTabChange={onTabChange} mode={mode} />}
    </div>
  )
}
