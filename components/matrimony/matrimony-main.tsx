"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/layout/app-layout"
import { QuickActions } from "@/components/navigation/quick-actions"
// Removed TopBackButton usage
import { Filter, Check, X } from "lucide-react"
import { MatrimonySwipeCard } from "@/components/matrimony/matrimony-swipe-card"
import { MatrimonyChatList } from "@/components/matrimony/matrimony-chat-list"
import { MatrimonyChatScreen } from "@/components/matrimony/matrimony-chat-screen"
import { MatrimonyFilterSheet } from "@/components/matrimony/matrimony-filter-sheet"
import { BackFloatingButton } from "@/components/navigation/back-floating-button"
import { SettingsScreen } from "@/components/settings/settings-screen"
import { AppSettings } from "@/components/settings/app-settings"
import { ProfileSetup } from "@/components/profile/profile-setup"
import { PremiumScreen } from "@/components/premium/premium-screen"
import { PaymentScreen } from "@/components/premium/payment-screen"
import { PremiumFeatures } from "@/components/premium/premium-features"
import { VerificationStatus } from "@/components/profile/verification-status"
import { MOCK_MATRIMONY_PROFILES, type MatrimonyProfile } from "@/lib/mockMatrimonyProfiles"

interface MatrimonyMainProps {
  onExit?: () => void
}


export function MatrimonyMain({ onExit }: MatrimonyMainProps) {
  const [profiles] = useState<MatrimonyProfile[]>(MOCK_MATRIMONY_PROFILES)
  const [currentScreen, setCurrentScreen] = useState<
    | "discover"
    | "messages"
    | "chat"
    | "profile"
    | "profile-setup"
    | "premium"
    | "payment"
    | "premium-features"
    | "verification-status"
    | "app-settings"
  >("discover")
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined)
  const currentProfile = profiles[currentCardIndex]
  const hasMoreProfiles = currentCardIndex < profiles.length

  const handleLike = () => {
    if (currentCardIndex < profiles.length - 1) setCurrentCardIndex((p) => p + 1)
    else setCurrentCardIndex(profiles.length)
  }
  const handlePass = () => {
    if (currentCardIndex < profiles.length - 1) setCurrentCardIndex((p) => p + 1)
    else setCurrentCardIndex(profiles.length)
  }

  return (
    <AppLayout 
      activeTab="discover" 
      onTabChange={() => {}} 
      showBottomTabs={false}
      onSettingsClick={() => setCurrentScreen("app-settings")}
      showSettingsButton={true}
      currentScreen={currentScreen}
    >
      {/* Floating header elements */}
      {currentScreen === "discover" && (
        <>
          <div className="fixed top-3 left-4 z-40 text-xl font-semibold">Find your match</div>
          <div className="fixed top-3 right-3 z-40">
            <Button
              variant="secondary"
              size="default"
              className="rounded-full px-5 py-4 shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}

      {currentScreen === "discover" && (
        <div className="h-screen overflow-hidden flex flex-col">
          <div className="p-4 pb-20 mt-10 max-w-3xl mx-auto w-full flex-1 overflow-hidden">
            <div className="space-y-6">
              {/* Card Stack */}
              <div className="relative h-[60vh] md:h-[500px] flex items-center justify-center transform -translate-y-2 md:-translate-y-4 overflow-visible">
                {hasMoreProfiles ? (
                  <div className="relative w-full max-w-sm h-full overflow-visible">
                    {profiles
                      .slice(currentCardIndex, Math.min(currentCardIndex + 4, profiles.length))
                      .map((profile, index) => (
                        <div key={profile.id} className="absolute inset-0 flex items-center justify-center">
                          <MatrimonySwipeCard
                            name={profile.name}
                            age={profile.age}
                            height={"5'6\""}
                            profession={profile.profession}
                            community={profile.community}
                            location={profile.location}
                            photos={profile.photos}
                            verified={profile.verified}
                            premium={profile.premium}
                            bio={profile.bio}
                            interests={profile.interests}
                            education={profile.education}
                            onConnect={index === 0 ? () => handleLike() : () => {}}
                            onNotNow={index === 0 ? () => handlePass() : () => {}}
                            onProfileClick={() => {
                              // TODO: Implement profile modal for matrimony
                              console.log("Profile clicked:", profile.name)
                            }}
                            stackIndex={index}
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  <Card className="w-full max-w-sm h-96 flex items-center justify-center">
                    <CardContent className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full" />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">No more profiles</h3>
                        <p className="text-sm text-muted-foreground">Check back later for new matches</p>
                      </div>
                      <Button onClick={() => setCurrentCardIndex(0)}>Start Over</Button>
                    </CardContent>
                  </Card>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {currentScreen === "messages" && (
        <div className="p-4 pb-20 mt-2 w-full">
          <MatrimonyChatList onChatClick={(chatId) => {
            setSelectedChatId(chatId)
            setCurrentScreen("chat")
          }} />
        </div>
      )}

      {currentScreen === "chat" && selectedChatId && (
        <div className="fixed inset-0 z-50 bg-background">
          <MatrimonyChatScreen 
            chatId={selectedChatId} 
            onBack={() => setCurrentScreen("messages")} 
          />
        </div>
      )}

      {currentScreen === "profile" && (
        <SettingsScreen
          onNavigate={(id) => {
            if (id === "profile") setCurrentScreen("profile-setup")
            else if (id === "premium") setCurrentScreen("premium")
            else if (id === "verification") setCurrentScreen("verification-status")
          }}
          onLogout={() => {
            window.location.href = "/auth"
          }}
        />
      )}

      {currentScreen === "profile-setup" && (
        <div className="p-0 pb-0 mt-0">
          <ProfileSetup onComplete={() => setCurrentScreen("discover")} onBack={() => setCurrentScreen("profile")} />
        </div>
      )}

      {currentScreen === "premium" && (
        <div className="p-0 pb-0 mt-0">
          <PremiumScreen
            onPlanSelect={(planId) => setSelectedPlanId(planId)}
            onSubscribe={(planId) => {
              setSelectedPlanId(planId)
              setCurrentScreen("payment")
            }}
            onBack={() => setCurrentScreen("profile")}
          />
        </div>
      )}

      {currentScreen === "payment" && (
        <div className="p-0 pb-0 mt-0">
          <PaymentScreen
            planId={selectedPlanId || "monthly"}
            onSuccess={() => setCurrentScreen("premium-features")}
            onCancel={() => setCurrentScreen("premium")}
          />
        </div>
      )}

      {currentScreen === "premium-features" && (
        <div className="p-0 pb-0 mt-0">
          <PremiumFeatures onBack={() => setCurrentScreen("profile")} />
        </div>
      )}

      {currentScreen === "verification-status" && (
        <div className="p-0 pb-0 mt-0">
          <VerificationStatus onBack={() => setCurrentScreen("profile")} />
        </div>
      )}

      {currentScreen === "app-settings" && (
        <div className="p-0 pb-0 mt-0">
          <AppSettings
            onNavigate={(id) => {
              if (id === "help_faq") window.alert("FAQ coming soon")
              else if (id === "help_contact") window.alert("Contact us at support@example.com")
              else if (id === "help_report_bug") window.alert("Bug report submitted")
              else if (id === "app_settings") window.alert("Open App Settings")
            }}
            onLogout={() => {
              window.location.href = "/auth"
            }}
            onBack={() => setCurrentScreen("profile")}
          />
        </div>
      )}

      {(currentScreen === "messages" || currentScreen === "profile") && (
        <BackFloatingButton onClick={() => setCurrentScreen("discover")} />
      )}

      {currentScreen !== "chat" && (
        <QuickActions
          onOpenChat={() => setCurrentScreen("messages")}
          onOpenProfile={() => setCurrentScreen("profile")}
          onDiscover={() => setCurrentScreen("discover")}
        />
      )}

      {/* Matrimony Filter Sheet */}
      <MatrimonyFilterSheet open={showFilters} onOpenChange={setShowFilters} />
    </AppLayout>
  )
}