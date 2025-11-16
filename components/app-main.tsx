"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { DiscoveryScreen } from "@/components/discovery/discovery-screen"
import { SearchScreen } from "@/components/discovery/search-screen"
import { ChatListScreen } from "@/components/chat/chat-list-screen"
import { ChatScreen } from "@/components/chat/chat-screen"
import { SettingsScreen } from "@/components/settings/settings-screen"
import { AppSettings } from "@/components/settings/app-settings"
import { PremiumScreen } from "@/components/premium/premium-screen"
import { ProfileSetup } from "@/components/profile/profile-setup"
import { MatchNotification } from "@/components/chat/match-notification"
import { SuperLikeModal } from "@/components/premium/super-like-modal"
import { QuickActions } from "@/components/navigation/quick-actions"
import { BackFloatingButton } from "@/components/navigation/back-floating-button"
import { PaymentScreen } from "./premium/payment-screen"
import { VerificationStatus } from "./profile/verification-status"
import { PremiumFeatures } from "./premium/premium-features"
import { ProfileView } from "@/components/profile/profile-view"
import { ActivityScreen } from "@/components/activity/activity-screen"
import { handleLogout } from "@/lib/logout"

type Screen =
  | "discover"
  | "search"
  | "explore"
  | "messages"
  | "activity"
  | "profile"
  | "chat"
  | "premium"
  | "profile-setup"
  | "payment"
  | "verification-status"
  | "premium-features"
  | "my-profile"
  | "app-settings"

interface AppState {
  currentScreen: Screen
  activeTab: string
  showMatch: boolean
  showSuperLike: boolean
  chatUserId?: string
  selectedPlanId?: string
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
        return <DiscoveryScreen />
      case "messages":
        return <ChatListScreen onChatClick={(chatId) => {
          setAppState(prev => ({
            ...prev,
            currentScreen: "chat",
            chatUserId: chatId
          }))
        }} />
      case "activity":
        return (
          <ActivityScreen
            onProfileClick={(userId) => {
              handleNavigation("my-profile")
            }}
            onMatchClick={(userId) => {
              handleNavigation("chat", { chatUserId: userId })
            }}
          />
        )
      case "chat":
        return (
          <div className="fixed inset-0 z-50">
            <ChatScreen 
              chatId={appState.chatUserId} 
              onBack={() => setAppState(prev => ({
                ...prev,
                currentScreen: "messages",
                activeTab: "messages"
              }))}
            />
          </div>
        )
      case "profile":
        return (
          <SettingsScreen
            onNavigate={(id) => {
              if (id === "profile") handleNavigation("profile-setup")
              else if (id === "premium") handleNavigation("premium")
              else if (id === "verification") handleNavigation("verification-status")
              else if (id === "help_faq") window.alert("FAQ coming soon")
              else if (id === "help_contact") window.alert("Contact us at support@example.com")
              else if (id === "help_report_bug") window.alert("Bug report submitted")
              else if (id === "app_settings") window.alert("Open App Settings")
            }
            }
            onLogout={handleLogout}
          />
        )
      case "premium":
        return (
          <PremiumScreen
            onPlanSelect={(planId) =>
              setAppState((prev) => ({ ...prev, selectedPlanId: planId }))
            }
            onSubscribe={(planId) =>
              setAppState((prev) => ({ ...prev, currentScreen: "payment", selectedPlanId: planId }))
            }
            onBack={() => handleNavigation("profile")}
          />
        )
      case "profile-setup":
        return <ProfileSetup onComplete={() => handleNavigation("discover")} onBack={() => handleNavigation("profile")} />
      case "payment":
        return (
          <PaymentScreen
            planId={appState.selectedPlanId || "monthly"}
            onSuccess={() => handleNavigation("premium-features")}
            onCancel={() => handleNavigation("premium")}
          />
        )
      case "verification-status":
        return <VerificationStatus onBack={() => handleNavigation("profile")} />
      case "premium-features":
        return <PremiumFeatures onBack={() => handleNavigation("profile")} />
      case "my-profile":
        return <ProfileView isOwnProfile onEdit={() => handleNavigation("profile-setup")} />
      case "app-settings":
        return (
          <AppSettings
            onNavigate={(id) => {
              if (id === "help_faq") window.alert("FAQ coming soon")
              else if (id === "help_contact") window.alert("Contact us at support@example.com")
              else if (id === "help_report_bug") window.alert("Bug report submitted")
              else if (id === "app_settings") window.alert("Open App Settings")
            }}
            onLogout={handleLogout}
            onBack={() => handleNavigation("profile")}
          />
        )
      default:
        return <DiscoveryScreen />
    }
  }

  return (
    <>
      <AppLayout 
        activeTab={appState.activeTab} 
        onTabChange={handleTabChange} 
        showBottomTabs={false}
        onSettingsClick={() => handleNavigation("app-settings")}
        showSettingsButton={true}
        currentScreen={appState.currentScreen}
      >
        {renderScreen()}
      </AppLayout>

      {(appState.currentScreen === "messages" || appState.currentScreen === "activity" || appState.currentScreen === "profile") && (
        <BackFloatingButton
          onClick={() => setAppState((prev) => ({ ...prev, currentScreen: "discover", activeTab: "discover" }))}
        />
      )}

      {appState.currentScreen !== "chat" && (
        <QuickActions
          activeTab={appState.activeTab}
          onOpenChat={() =>
            setAppState((prev) => ({ ...prev, currentScreen: "messages", activeTab: "messages" }))
          }
          onOpenActivity={() =>
            setAppState((prev) => ({ ...prev, currentScreen: "activity", activeTab: "activity" }))
          }
          onOpenProfile={() =>
            setAppState((prev) => ({ ...prev, currentScreen: "profile", activeTab: "profile" }))
          }
          onDiscover={() =>
            setAppState((prev) => ({ ...prev, currentScreen: "discover", activeTab: "discover" }))
          }
        />
      )}

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