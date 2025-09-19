"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { DiscoveryScreen } from "@/components/discovery/discovery-screen"
import { SearchScreen } from "@/components/discovery/search-screen"
import { ChatListScreen } from "@/components/chat/chat-list-screen"
import { ChatScreen } from "@/components/chat/chat-screen"
import { SettingsScreen } from "@/components/settings/settings-screen"
import { PremiumScreen } from "@/components/premium/premium-screen"
import { ProfileSetup } from "@/components/profile/profile-setup"
import { MatchNotification } from "@/components/chat/match-notification"
import { SuperLikeModal } from "@/components/premium/super-like-modal"
import { DiscoverySettings } from "@/components/settings/discovery-settings"

type Screen =
  | "discover"
  | "search"
  | "explore"
  | "messages"
  | "profile"
  | "chat"
  | "premium"
  | "profile-setup"
  | "discovery-settings"

interface AppState {
  currentScreen: Screen
  activeTab: string
  showMatch: boolean
  showSuperLike: boolean
  chatUserId?: string
}

export function AppMain() {
  const [appState, setAppState] = useState<AppState>({
    currentScreen: "discover",
    activeTab: "discover",
    showMatch: false,
    showSuperLike: false,
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key to go back
      if (event.key === "Escape") {
        if (appState.showMatch) {
          setAppState((prev) => ({ ...prev, showMatch: false }))
        } else if (appState.showSuperLike) {
          setAppState((prev) => ({ ...prev, showSuperLike: false }))
        } else if (appState.currentScreen === "chat") {
          setAppState((prev) => ({ ...prev, currentScreen: "messages", activeTab: "messages" }))
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [appState.showMatch, appState.showSuperLike, appState.currentScreen])

  const handleTabChange = (tabId: string) => {
    setAppState((prev) => ({
      ...prev,
      activeTab: tabId,
      currentScreen: tabId as Screen,
    }))
  }

  const handleNavigation = (screen: Screen, options?: { chatUserId?: string }) => {
    setAppState((prev) => ({
      ...prev,
      currentScreen: screen,
      chatUserId: options?.chatUserId,
    }))
  }

  const handleMatch = () => {
    setAppState((prev) => ({ ...prev, showMatch: true }))
  }

  const handleSuperLike = () => {
    setAppState((prev) => ({ ...prev, showSuperLike: true }))
  }

  const renderScreen = () => {
    switch (appState.currentScreen) {
      case "discover":
        return <DiscoveryScreen />
      case "search":
        return <SearchScreen />
      case "explore":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Explore</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </div>
        )
      case "messages":
        return <ChatListScreen />
      case "chat":
        return <ChatScreen />
      case "profile":
        return <SettingsScreen />
      case "premium":
        return <PremiumScreen />
      case "profile-setup":
        return <ProfileSetup onComplete={() => handleNavigation("discover")} />
      case "discovery-settings":
        return <DiscoverySettings />
      default:
        return <DiscoveryScreen />
    }
  }

  const shouldShowBottomTabs = !["chat", "premium", "profile-setup", "discovery-settings"].includes(
    appState.currentScreen,
  )

  return (
    <>
      <AppLayout activeTab={appState.activeTab} onTabChange={handleTabChange} showBottomTabs={shouldShowBottomTabs}>
        {renderScreen()}
      </AppLayout>

      {/* Match Notification */}
      {appState.showMatch && (
        <MatchNotification
          match={{
            id: "1",
            name: "Priya",
            avatar: "/indian-woman-professional.png",
            age: 26,
            mutualInterests: ["Travel", "Photography", "Yoga"],
          }}
          onStartChat={() => {
            setAppState((prev) => ({
              ...prev,
              showMatch: false,
              currentScreen: "chat",
              chatUserId: "1",
            }))
          }}
          onKeepSwiping={() => setAppState((prev) => ({ ...prev, showMatch: false }))}
          onClose={() => setAppState((prev) => ({ ...prev, showMatch: false }))}
        />
      )}

      {/* Super Like Modal */}
      {appState.showSuperLike && (
        <SuperLikeModal
          open={appState.showSuperLike}
          onOpenChange={(open) => setAppState((prev) => ({ ...prev, showSuperLike: open }))}
          onSuperLike={() => {
            setAppState((prev) => ({ ...prev, showSuperLike: false }))
            // Trigger match after super like
            setTimeout(() => handleMatch(), 1000)
          }}
          onUpgrade={() => {
            setAppState((prev) => ({ ...prev, showSuperLike: false, currentScreen: "premium" }))
          }}
          remainingSuperLikes={2}
          isPremium={false}
        />
      )}
    </>
  )
}
