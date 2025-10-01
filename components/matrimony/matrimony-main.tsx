"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/layout/app-layout"
import { QuickActions } from "@/components/navigation/quick-actions"
// Removed TopBackButton usage
import { Heart, Filter } from "lucide-react"
import { MatrimonySwipeCard } from "@/components/matrimony/matrimony-swipe-card"
import { MatrimonyChatList } from "@/components/matrimony/matrimony-chat-list"
import { FilterSheet } from "@/components/discovery/filter-sheet"
import { BackFloatingButton } from "@/components/navigation/back-floating-button"
import { SettingsScreen } from "@/components/settings/settings-screen"
import { ProfileSetup } from "@/components/profile/profile-setup"
import { PremiumScreen } from "@/components/premium/premium-screen"
import { PaymentScreen } from "@/components/premium/payment-screen"
import { PremiumFeatures } from "@/components/premium/premium-features"
import { VerificationStatus } from "@/components/profile/verification-status"

interface MatrimonyMainProps {
  onExit?: () => void
}

interface MatrimonyProfile {
  id: string
  name: string
  age: number
  education: string
  profession: string
  location: string
  community?: string
  avatar?: string
}

const SAMPLE_PROFILES: MatrimonyProfile[] = [
  {
    id: "m1",
    name: "Aditi Sharma",
    age: 27,
    education: "MBA, IIM Ahmedabad",
    profession: "Product Manager",
    location: "Bengaluru, India",
    community: "Brahmin",
    avatar: "/professional-woman-smiling.png",
  },
  {
    id: "m2",
    name: "Rahul Mehta",
    age: 30,
    education: "B.Tech, IIT Bombay",
    profession: "Senior Software Engineer",
    location: "Pune, India",
    community: "Vaishya",
    avatar: "/professional-headshot.png",
  },
]

export function MatrimonyMain({ onExit }: MatrimonyMainProps) {
  const [profiles] = useState<MatrimonyProfile[]>(SAMPLE_PROFILES)
  const [currentScreen, setCurrentScreen] = useState<
    | "discover"
    | "messages"
    | "profile"
    | "profile-setup"
    | "premium"
    | "payment"
    | "premium-features"
    | "verification-status"
  >("discover")
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
    <AppLayout activeTab="discover" onTabChange={() => {}} showBottomTabs={false}>
      {/* Floating header elements */}
      {currentScreen === "discover" && (
        <>
          <div className="fixed top-3 left-4 z-40 text-xl font-semibold">Discover</div>
          <div className="fixed top-3 right-3 z-40">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full px-4 py-3 shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {currentScreen === "discover" && (
        <div className="h-screen overflow-hidden flex flex-col">
          <div className="p-4 pb-20 mt-10 max-w-3xl mx-auto w-full flex-1 overflow-hidden">
            <div className="relative h-[70vh] md:h-[600px] flex items-center justify-center transform -translate-y-14 md:-translate-y-16">
            {hasMoreProfiles && currentProfile ? (
              <MatrimonySwipeCard
                name={currentProfile.name}
                age={currentProfile.age}
                height={"5'6\""}
                profession={`${currentProfile.education} • ${currentProfile.profession}`}
                community={currentProfile.community}
                location={currentProfile.location}
                avatar={currentProfile.avatar || "/placeholder-user.jpg"}
                verified
                onConnect={handleLike}
                onNotNow={handlePass}
              />
            ) : (
              <Card className="w-full max-w-sm h-96 flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-muted-foreground" />
                  </div>
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
      )}

      {currentScreen === "messages" && (
        <div className="p-4 pb-20 mt-2 w-full">
          <MatrimonyChatList />
        </div>
      )}

      {currentScreen === "profile" && (
        <div className="p-4 pb-20 mt-2 w-full">
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
        </div>
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

      {(currentScreen === "messages" || currentScreen === "profile") && (
        <BackFloatingButton onClick={() => setCurrentScreen("discover")} />
      )}

      <QuickActions
        onOpenChat={() => setCurrentScreen("messages")}
        onOpenProfile={() => setCurrentScreen("profile")}
      />

      {/* Filter Sheet */}
      <FilterSheet open={showFilters} onOpenChange={setShowFilters} />
    </AppLayout>
  )
}