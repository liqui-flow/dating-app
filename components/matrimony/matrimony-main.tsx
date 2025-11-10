"use client"

import { useState, useEffect } from "react"
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
import { type MatrimonyProfile } from "@/lib/mockMatrimonyProfiles"
import { supabase } from "@/lib/supabaseClient"

// Helper function to calculate age from date of birth
function calculateAge(dob: string | null, ageFromProfile: number | null): number {
	if (ageFromProfile) {
		return ageFromProfile
	}
	if (dob) {
		const birthDate = new Date(dob)
		const today = new Date()
		let age = today.getFullYear() - birthDate.getFullYear()
		const monthDiff = today.getMonth() - birthDate.getMonth()
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--
		}
		return age
	}
	return 0
}

// Helper function to convert height from cm to feet and inches
function formatHeight(heightCm: number | null): string | undefined {
	if (!heightCm) return undefined
	const totalInches = Math.round(heightCm / 2.54)
	const feet = Math.floor(totalInches / 12)
	const inches = totalInches % 12
	return `${feet}'${inches}"`
}

interface MatrimonyMainProps {
  onExit?: () => void
}


export function MatrimonyMain({ onExit }: MatrimonyMainProps) {
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([])
  const [loading, setLoading] = useState(true)
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

  // Fetch profiles from Supabase
  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true)

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        // Fetch matrimony profiles (only completed ones)
        const { data: matrimonyProfiles, error: profilesError } = await supabase
          .from("matrimony_profiles")
          .select("user_id, name, age, gender")
          .eq("profile_completed", true)

        if (profilesError) {
          console.error("Error fetching matrimony profiles:", profilesError)
          return
        }

        if (!matrimonyProfiles || matrimonyProfiles.length === 0) {
          setProfiles([])
          setLoading(false)
          return
        }

        // Get user IDs
        const userIds = matrimonyProfiles.map((p) => p.user_id)

        // Fetch photos
        const { data: photos, error: photosError } = await supabase
          .from("matrimony_photos")
          .select("user_id, photo_url, display_order, is_primary")
          .in("user_id", userIds)
          .order("display_order", { ascending: true })

        if (photosError) {
          console.error("Error fetching photos:", photosError)
        }

        // Fetch personal details (for height)
        const { data: personalDetails, error: personalError } = await supabase
          .from("matrimony_personal_details")
          .select("user_id, height_cm")
          .in("user_id", userIds)

        if (personalError) {
          console.error("Error fetching personal details:", personalError)
        }

        // Fetch career/education (for profession and education)
        const { data: careerEducation, error: careerError } = await supabase
          .from("matrimony_career_education")
          .select("user_id, job_title, highest_education, work_city, work_state, work_country")
          .in("user_id", userIds)

        if (careerError) {
          console.error("Error fetching career education:", careerError)
        }

        // Fetch cultural details (for community, date_of_birth, location)
        const { data: culturalDetails, error: culturalError } = await supabase
          .from("matrimony_cultural_details")
          .select("user_id, community, date_of_birth, place_of_birth")
          .in("user_id", userIds)

        if (culturalError) {
          console.error("Error fetching cultural details:", culturalError)
        }

        // Fetch bio
        const { data: bios, error: bioError } = await supabase
          .from("matrimony_bio")
          .select("user_id, bio")
          .in("user_id", userIds)

        if (bioError) {
          console.error("Error fetching bios:", bioError)
        }

        // Fetch ID verifications (for verified status)
        const { data: verifications, error: verificationsError } = await supabase
          .from("id_verifications")
          .select("user_id, verification_status")
          .in("user_id", userIds)

        if (verificationsError) {
          console.error("Error fetching verifications:", verificationsError)
        }

        // Combine all data
        const combinedProfiles: MatrimonyProfile[] = matrimonyProfiles
          .map((matrimonyProfile) => {
            const photosData = photos?.filter((p) => p.user_id === matrimonyProfile.user_id).map((p) => p.photo_url) || []
            const personalDetail = personalDetails?.find((pd) => pd.user_id === matrimonyProfile.user_id)
            const careerData = careerEducation?.find((ce) => ce.user_id === matrimonyProfile.user_id)
            const culturalData = culturalDetails?.find((cd) => cd.user_id === matrimonyProfile.user_id)
            const bioData = bios?.find((b) => b.user_id === matrimonyProfile.user_id)
            const verification = verifications?.find((v) => v.user_id === matrimonyProfile.user_id)

            // Skip if no essential data
            if (!matrimonyProfile.name) {
              return null
            }

            // Exclude current user's profile
            if (user && matrimonyProfile.user_id === user.id) {
              return null
            }

            // Calculate age (prefer from profile, fallback to DOB calculation)
            const calculatedAge = calculateAge(
              culturalData?.date_of_birth || null,
              matrimonyProfile.age
            )

            // Format location
            const locationParts = []
            if (careerData?.work_city) locationParts.push(careerData.work_city)
            if (careerData?.work_state) locationParts.push(careerData.work_state)
            if (careerData?.work_country) locationParts.push(careerData.work_country)
            const location = locationParts.length > 0 
              ? locationParts.join(", ") 
              : culturalData?.place_of_birth || "India"

            const height = formatHeight(personalDetail?.height_cm || null)

            return {
              id: matrimonyProfile.user_id,
              name: matrimonyProfile.name,
              age: calculatedAge,
              education: careerData?.highest_education || "",
              profession: careerData?.job_title || "",
              location: location,
              community: culturalData?.community || undefined,
              photos: photosData.length > 0 ? photosData : ["/placeholder-user.jpg"],
              bio: bioData?.bio || undefined,
              interests: [], // Not in current schema, can be added later
              verified: verification?.verification_status === "approved",
              premium: false, // Not in current schema, can be added later
              height, // Add height to profile
            }
          })
          .filter((profile): profile is MatrimonyProfile => profile !== null)

        setProfiles(combinedProfiles)
      } catch (error) {
        console.error("Error fetching matrimony profiles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

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
            {loading ? (
              <div className="flex items-center justify-center h-[60vh] md:h-[500px]">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading profiles...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Card Stack */}
                <div className="relative h-[60vh] md:h-[500px] flex items-center justify-center transform -translate-y-2 md:-translate-y-4 overflow-visible">
                  {hasMoreProfiles && profiles.length > 0 ? (
                    <div className="relative w-full max-w-sm h-full overflow-visible">
                      {profiles
                        .slice(currentCardIndex, Math.min(currentCardIndex + 4, profiles.length))
                        .map((profile, index) => (
                          <div key={profile.id} className="absolute inset-0 flex items-center justify-center">
                            <MatrimonySwipeCard
                              name={profile.name}
                              age={profile.age}
                              height={profile.height}
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
                          <p className="text-sm text-muted-foreground">
                            {profiles.length === 0 
                              ? "No profiles available. Check back later!" 
                              : "Check back later for new matches"}
                          </p>
                        </div>
                        {profiles.length > 0 && (
                          <Button onClick={() => setCurrentCardIndex(0)}>Start Over</Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
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
          onLogout={async () => {
            await supabase.auth.signOut()
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
            onLogout={async () => {
              await supabase.auth.signOut()
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