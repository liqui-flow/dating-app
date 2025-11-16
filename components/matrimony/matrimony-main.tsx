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
import { DynamicBackground } from "@/components/discovery/dynamic-background"
import { BackFloatingButton } from "@/components/navigation/back-floating-button"
import { SettingsScreen } from "@/components/settings/settings-screen"
import { ActivityScreen } from "@/components/activity/activity-screen"
import { AppSettings } from "@/components/settings/app-settings"
import { ProfileSetup } from "@/components/profile/profile-setup"
import { PremiumScreen } from "@/components/premium/premium-screen"
import { PaymentScreen } from "@/components/premium/payment-screen"
import { PremiumFeatures } from "@/components/premium/premium-features"
import { VerificationStatus } from "@/components/profile/verification-status"
import { type MatrimonyProfile } from "@/lib/mockMatrimonyProfiles"
import { supabase } from "@/lib/supabaseClient"
import { handleLogout } from "@/lib/logout"

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
    | "activity"
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
        console.log("Starting to fetch matrimony profiles...")

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error("Auth error:", authError)
          setProfiles([])
          setLoading(false)
          return
        }

        if (!user) {
          console.log("No user found, redirecting to auth...")
          setProfiles([])
          setLoading(false)
          return
        }

        console.log("User authenticated:", user.id)

        // Fetch current user's gender from user_profiles
        const { data: currentUserProfile, error: currentUserError } = await supabase
          .from("user_profiles")
          .select("gender")
          .eq("user_id", user.id)
          .single()

        if (currentUserError && currentUserError.code !== 'PGRST116') {
          console.error("Error fetching current user profile:", currentUserError)
        }

        // Fetch matrimony profiles from consolidated table (only completed ones)
        console.log("Fetching matrimony profiles from matrimony_profile_full...")
        const { data: matrimonyProfiles, error: profilesError } = await supabase
          .from("matrimony_profile_full")
          .select(`
            user_id,
            name,
            age,
            gender,
            photos,
            personal,
            career,
            cultural,
            bio
          `)
          .eq("profile_completed", true)

        if (profilesError) {
          console.error("Error fetching matrimony profiles:", profilesError)
          console.error("Error details:", {
            message: profilesError.message,
            details: profilesError.details,
            hint: profilesError.hint,
            code: profilesError.code
          })
          setProfiles([])
          setLoading(false)
          return
        }

        console.log(`Found ${matrimonyProfiles?.length || 0} completed matrimony profiles`)

        if (!matrimonyProfiles || matrimonyProfiles.length === 0) {
          console.log("No completed matrimony profiles found")
          setProfiles([])
          setLoading(false)
          return
        }

        // Get user IDs for verifications
        const userIds = matrimonyProfiles.map((p) => p.user_id)
        console.log(`Fetching verifications for ${userIds.length} users...`)

        // Fetch ID verifications (for verified status)
        const { data: verifications, error: verificationsError } = await supabase
          .from("id_verifications")
          .select("user_id, verification_status")
          .in("user_id", userIds)

        if (verificationsError) {
          console.error("Error fetching verifications:", verificationsError)
        }

        // Get current user's gender for filtering
        const currentUserGender = currentUserProfile?.gender
        console.log("Current user gender:", currentUserGender)

        // Combine all data from consolidated table
        const combinedProfiles: MatrimonyProfile[] = matrimonyProfiles
          .map((matrimonyProfile) => {
            // Extract data from JSONB fields
            const photosData = (matrimonyProfile.photos as string[]) || []
            const personalData = (matrimonyProfile.personal as any) || {}
            const careerData = (matrimonyProfile.career as any) || {}
            const culturalData = (matrimonyProfile.cultural as any) || {}
            const bioText = matrimonyProfile.bio || null
            const verification = verifications?.find((v) => v.user_id === matrimonyProfile.user_id)

            // Skip if no essential data
            if (!matrimonyProfile.name) {
              return null
            }

            // Exclude current user's profile
            if (user && matrimonyProfile.user_id === user.id) {
              return null
            }

            // Filter by gender preference
            // If current user is male, show only female profiles
            // If current user is female, show only male profiles
            // If current user gender is not set or is 'prefer_not_to_say', show all profiles
            if (currentUserGender === 'male' && matrimonyProfile.gender !== 'Female') {
              return null
            }
            if (currentUserGender === 'female' && matrimonyProfile.gender !== 'Male') {
              return null
            }
            // If currentUserGender is null or 'prefer_not_to_say', show all profiles

            // Calculate age (prefer from profile, fallback to DOB calculation)
            let calculatedAge = matrimonyProfile.age || 0
            if (culturalData?.date_of_birth) {
              const birthDate = new Date(culturalData.date_of_birth)
              const today = new Date()
              let age = today.getFullYear() - birthDate.getFullYear()
              const monthDiff = today.getMonth() - birthDate.getMonth()
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--
              }
              calculatedAge = age
            }

            // Format location from work_location object
            const workLocation = careerData?.work_location || {}
            const locationParts = []
            if (workLocation.city) locationParts.push(workLocation.city)
            if (workLocation.state) locationParts.push(workLocation.state)
            if (workLocation.country) locationParts.push(workLocation.country)
            const location = locationParts.length > 0 
              ? locationParts.join(", ") 
              : culturalData?.place_of_birth || "India"

            // Format height
            const height = personalData?.height_cm ? `${personalData.height_cm} cm` : undefined

            return {
              id: matrimonyProfile.user_id,
              name: matrimonyProfile.name,
              age: calculatedAge,
              education: careerData?.highest_education || "",
              profession: careerData?.job_title || "",
              location: location,
              community: culturalData?.community || undefined,
              photos: photosData.length > 0 ? photosData : ["/placeholder-user.jpg"],
              bio: bioText || undefined,
              interests: [], // Not in current schema, can be added later
              verified: verification?.verification_status === "approved",
              premium: false, // Not in current schema, can be added later
              height, // Add height to profile
            }
          })
          .filter((profile): profile is MatrimonyProfile => profile !== null)

        console.log(`Successfully processed ${combinedProfiles.length} matrimony profiles for display`)
        setProfiles(combinedProfiles)
      } catch (error) {
        console.error("Unexpected error fetching matrimony profiles:", error)
        setProfiles([])
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  // Prevent body scroll when on discover screen
  useEffect(() => {
    if (currentScreen === "discover") {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [currentScreen])

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
        <div className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col relative">
          {/* Dynamic Background */}
          <DynamicBackground imageUrl={currentProfile?.photos?.[0] || null} />
          
          <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading profiles...</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {/* Card Stack */}
                <div className="relative w-full max-w-sm h-full flex items-center justify-center overflow-hidden">
                  {hasMoreProfiles && profiles.length > 0 ? (
                    <div className="relative w-full h-full overflow-visible">
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

      {currentScreen === "activity" && (
        <div className="p-4 pb-20 mt-2 w-full">
          <ActivityScreen
            onProfileClick={(userId) => {
              // Navigate to profile view if needed
              console.log("Profile clicked:", userId)
            }}
            onMatchClick={(userId) => {
              setSelectedChatId(userId)
              setCurrentScreen("chat")
            }}
          />
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
          onLogout={handleLogout}
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
            onLogout={handleLogout}
            onBack={() => setCurrentScreen("profile")}
          />
        </div>
      )}

      {(currentScreen === "messages" || currentScreen === "activity" || currentScreen === "profile") && (
        <BackFloatingButton onClick={() => setCurrentScreen("discover")} />
      )}

      {currentScreen !== "chat" && (
        <QuickActions
          activeTab={currentScreen}
          onOpenChat={() => setCurrentScreen("messages")}
          onOpenActivity={() => setCurrentScreen("activity")}
          onOpenProfile={() => setCurrentScreen("profile")}
          onDiscover={() => setCurrentScreen("discover")}
        />
      )}

      {/* Matrimony Filter Sheet */}
      <MatrimonyFilterSheet open={showFilters} onOpenChange={setShowFilters} />
    </AppLayout>
  )
}