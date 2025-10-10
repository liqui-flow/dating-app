"use client"

import { cn } from "@/lib/utils"

import type { ReactNode } from "react"
import { BottomTabs } from "@/components/navigation/bottom-tabs"

interface AppLayoutProps {
  children: ReactNode
  activeTab?: string
  onTabChange?: (tabId: string) => void
  showBottomTabs?: boolean
}

export function AppLayout({ children, activeTab, onTabChange, showBottomTabs = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={cn("pb-16 sm:pb-20", !showBottomTabs && "pb-0")}>{children}</main>

      {showBottomTabs && <BottomTabs activeTab={activeTab} onTabChange={onTabChange} />}
    </div>
  )
}
