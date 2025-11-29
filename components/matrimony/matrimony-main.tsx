"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/layout/app-layout"
import { QuickActions } from "@/components/navigation/quick-actions"
// Removed TopBackButton usage
import { Filter, Check, X } from "lucide-react"
import { MatrimonySwipeCard } from "@/components/matrimony/matrimony-swipe-card"
import { MatrimonyChatList } from "@/components/matrimony/matrimony-chat-list"
import { ChatScreen } from "@/components/chat/chat-screen"
import { MatrimonyFilterSheet } from "@/components/matrimony/matrimony-filter-sheet"
import { DynamicBackground } from "@/components/discovery/dynamic-background"
import { StaticBackground } from "@/components/discovery/static-background"
import { BackFloatingButton } from "@/components/navigation/back-floating-button"
import { SettingsScreen } from "@/components/settings/settings-screen"
import { ActivityScreen } from "@/components/activity/activity-screen"
import { AppSettings } from "@/components/settings/app-settings"
import { ProfileSetup } from "@/components/profile/profile-setup"
import { PremiumScreen } from "@/components/premium/premium-screen"
import { PaymentScreen } from "@/components/premium/payment-screen"
import { PremiumFeatures } from "@/components/premium/premium-features"
import { VerificationStatus } from "@/components/profile/verification-status"
import { EditProfile } from "@/components/profile/edit-profile"
import { type MatrimonyProfile } from "@/lib/mockMatrimonyProfiles"
import { supabase } from "@/lib/supabaseClient"
import { handleLogout } from "@/lib/logout"
import { recordMatrimonyLike, getMatrimonyLikedProfiles } from "@/lib/matchmakingService"
import { MatchNotification } from "@/components/chat/match-notification"
import type { FilterState } from "@/components/matrimony/matrimony-filter-sheet"
import { useToast } from "@/hooks/use-toast"
import { useMatrimonyShortlist } from "@/hooks/useMatrimonyShortlist"
import { MatrimonyShortlistView } from "@/components/matrimony/matrimony-shortlist"
import { MatrimonyProfileModal } from "@/components/matrimony/matrimony-profile-modal"

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
  initialScreen?:
    | "discover"
    | "messages"
    | "activity"
    | "chat"
    | "profile"
    | "profile-setup"
    | "edit-profile"
    | "premium"
    | "payment"
    | "premium-features"
    | "verification-status"
    | "app-settings"
    | "shortlist"
}


export function MatrimonyMain({ onExit, initialScreen = "discover" }: MatrimonyMainProps) {
  const router = useRouter()
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentScreen, setCurrentScreen] = useState<
    | "discover"
    | "messages"
    | "activity"
    | "chat"
    | "profile"
    | "profile-setup"
    | "edit-profile"
    | "premium"
    | "payment"
    | "premium-features"
    | "verification-status"
    | "app-settings"
    | "shortlist"
  >(initialScreen)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined)
  const [showMatchNotification, setShowMatchNotification] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<MatrimonyProfile | null>(null)
  const [matchedMatchId, setMatchedMatchId] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null)
  const [shortlistModalProfile, setShortlistModalProfile] = useState<MatrimonyProfile | null>(null)
  const { toast } = useToast()
  const {
    shortlistedProfiles,
    shortlistedIds,
    loading: shortlistLoading,
    removeProfile: removeFromShortlist,
    toggleShortlist,
  } = useMatrimonyShortlist()

  useEffect(() => {
    setCurrentScreen(initialScreen)
  }, [initialScreen])

  const handleOpenShortlist = useCallback(() => {
    setCurrentScreen("shortlist")
    router.push("/matrimony/shortlist")
  }, [router])

  const handleOpenDiscover = useCallback(() => {
    setCurrentScreen("discover")
    router.push("/matrimony/discovery")
  }, [router])

  const handleShortlistToggle = useCallback(
    async (profile: MatrimonyProfile) => {
      const wasShortlisted = shortlistedIds.has(profile.id)
      const result = await toggleShortlist(profile)

      if (result.success) {
        toast({
          title: wasShortlisted ? "Removed from shortlist" : "Added to shortlist",
          description: wasShortlisted
            ? `${profile.name} was removed from your saved profiles.`
            : `${profile.name} has been saved for later.`,
        })
      } else {
        toast({
          title: "Unable to update shortlist",
          description: result.error || "Please try again.",
          variant: "destructive",
        })
      }

      return result
    },
    [shortlistedIds, toggleShortlist, toast],
  )

  const handleShortlistRemove = useCallback(
    async (profileId: string, profileName?: string) => {
      const result = await removeFromShortlist(profileId)

      if (result.success) {
        toast({
          title: "Removed from shortlist",
          description: profileName ? `${profileName} was removed.` : "Profile removed.",
        })
      } else {
        toast({
          title: "Unable to update shortlist",
          description: result.error || "Please try again.",
          variant: "destructive",
        })
      }

      return result
    },
    [removeFromShortlist, toast],
  )

  const handleShortlistConnect = useCallback(
    async (profile: MatrimonyProfile) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
          throw new Error("Please sign in to continue.")
        }

        const result = await recordMatrimonyLike(user.id, profile.id, "like")
        if (!result.success) {
          throw new Error(result.error || "Unable to connect.")
        }

        toast({
          title: `You liked ${profile.name}`,
          description: "We'll notify you if it's a match.",
        })
      } catch (error: any) {
        toast({
          title: "Could not connect",
          description: error.message || "Please try again.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

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
        
        // Build query with age filter if applied
        let query = supabase
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
            family,
            bio
          `)
          .eq("profile_completed", true)

        // Apply age filter at database level if available
        if (appliedFilters?.ageRange) {
          query = query
            .gte("age", appliedFilters.ageRange[0])
            .lte("age", appliedFilters.ageRange[1])
        }

        const { data: matrimonyProfiles, error: profilesError } = await query

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

        // Get already liked/passed profiles to exclude from discovery
        const likedProfileIds = await getMatrimonyLikedProfiles(user.id)
        console.log(`Excluding ${likedProfileIds.length} already liked/passed matrimony profiles`)

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

            // Exclude already liked/passed profiles
            if (likedProfileIds.includes(matrimonyProfile.user_id)) {
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

            // Apply filters (if any are set)
            if (appliedFilters) {
              // Apply height filter
              if (appliedFilters.heightRange) {
                const heightCm = personalData?.height_cm
                if (heightCm) {
                  if (heightCm < appliedFilters.heightRange[0] || 
                      heightCm > appliedFilters.heightRange[1]) {
                    return null
                  }
                }
              }

              // Apply location filter (match only by city)
              if (appliedFilters.locations && appliedFilters.locations.length > 0) {
                // If "Any" is selected, skip location filtering
                if (!appliedFilters.locations.includes("Any")) {
                  const profileCity = workLocation.city?.toLowerCase() || ""
                  const matchesLocation = appliedFilters.locations.some(selectedCity => {
                    const selectedCityLower = selectedCity.toLowerCase()
                    // Match only by city name (case-insensitive)
                    return profileCity === selectedCityLower
                  })
                  
                  if (!matchesLocation) {
                    return null
                  }
                }
              }

              // Apply education filter
              if (appliedFilters.educationPrefs && appliedFilters.educationPrefs.length > 0) {
                if (!appliedFilters.educationPrefs.includes("Any")) {
                  const education = (careerData?.highest_education || "").toLowerCase()
                  const matchesEducation = appliedFilters.educationPrefs.some(pref => {
                    return education.includes(pref.toLowerCase()) ||
                           pref.toLowerCase().includes(education)
                  })
                  if (!matchesEducation) {
                    return null
                  }
                }
              }

              // Apply profession filter
              if (appliedFilters.professionPrefs && appliedFilters.professionPrefs.length > 0) {
                if (!appliedFilters.professionPrefs.includes("Any")) {
                  const profession = (careerData?.job_title || "").toLowerCase()
                  const matchesProfession = appliedFilters.professionPrefs.some(pref => {
                    return profession.includes(pref.toLowerCase()) ||
                           pref.toLowerCase().includes(profession)
                  })
                  if (!matchesProfession) {
                    return null
                  }
                }
              }

              // Apply community filter
              if (appliedFilters.communities && appliedFilters.communities.length > 0) {
                if (!appliedFilters.communities.includes("Any")) {
                  const community = (culturalData?.community || "").toLowerCase()
                  const matchesCommunity = appliedFilters.communities.some(pref => {
                    return community.includes(pref.toLowerCase()) ||
                           pref.toLowerCase().includes(community)
                  })
                  if (!matchesCommunity) {
                    return null
                  }
                }
              }

              // Apply family type filter
              if (appliedFilters.familyTypePrefs && appliedFilters.familyTypePrefs.length > 0) {
                if (!appliedFilters.familyTypePrefs.includes("Any")) {
                  const familyType = ((matrimonyProfile.family as any)?.family_type || "").toLowerCase()
                  const matchesFamilyType = appliedFilters.familyTypePrefs.some(pref => {
                    return familyType.includes(pref.toLowerCase())
                  })
                  if (!matchesFamilyType) {
                    return null
                  }
                }
              }

              // Apply diet filter
              if (appliedFilters.dietPrefs && appliedFilters.dietPrefs.length > 0) {
                if (!appliedFilters.dietPrefs.includes("Any")) {
                  const diet = (personalData?.diet || "").toLowerCase()
                  const matchesDiet = appliedFilters.dietPrefs.some(pref => {
                    const prefLower = pref.toLowerCase()
                    // Handle special cases
                    if (prefLower === "strictly vegetarian" && diet.includes("vegetarian")) return true
                    if (prefLower === "jain vegetarian" && diet.includes("jain")) return true
                    if (prefLower === "non-vegetarian" && diet.includes("non")) return true
                    if (prefLower === "open to both") return true
                    return diet.includes(prefLower) || prefLower.includes(diet)
                  })
                  if (!matchesDiet) {
                    return null
                  }
                }
              }

              // Apply lifestyle filter (smoker/drinker)
              if (appliedFilters.lifestylePrefs && appliedFilters.lifestylePrefs.length > 0) {
                if (!appliedFilters.lifestylePrefs.includes("Any")) {
                  const isSmoker = personalData?.smoker || false
                  const isDrinker = personalData?.drinker || false
                  
                  const matchesLifestyle = appliedFilters.lifestylePrefs.some(pref => {
                    const prefLower = pref.toLowerCase()
                    if (prefLower === "non-smoker" && isSmoker) return false
                    if (prefLower === "non-drinker" && isDrinker) return false
                    if (prefLower === "occasional drinker" && !isDrinker) return false
                    if (prefLower === "social drinker" && !isDrinker) return false
                    return true
                  })
                  
                  if (!matchesLifestyle) {
                    return null
                  }
                }
              }

              // Apply verified only filter
              if (appliedFilters.verifiedOnly) {
                if (verification?.verification_status !== "approved") {
                  return null
                }
              }

              // Apply premium only filter (skip for now - not implemented in schema)
              // if (appliedFilters.premiumOnly) {
              //   // TODO: Add premium check when premium feature is implemented
              // }
            }

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
  }, [appliedFilters])

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

  const handleLike = async () => {
    try {
      const currentProfile = profiles[currentCardIndex]
      if (!currentProfile) {
        console.error('[handleLike] No current profile')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('[handleLike] No user found')
        return
      }

      console.log('[handleLike] User liking profile:', { userId: user.id, profileId: currentProfile.id })

      // Record the like in database
      const result = await recordMatrimonyLike(user.id, currentProfile.id, 'like')
      
      console.log('[handleLike] Result:', result)

      if (!result.success) {
        console.error('[handleLike] Failed to record like:', result.error)
      }
      
      if (result.success && result.isMatch) {
        console.log('[handleLike] Match detected!', result.matchId)
        // Show match notification
        setMatchedProfile(currentProfile)
        setMatchedMatchId(result.matchId || null)
        setShowMatchNotification(true)
      }

      if (currentCardIndex < profiles.length - 1) setCurrentCardIndex((p) => p + 1)
      else setCurrentCardIndex(profiles.length)
    } catch (error) {
      console.error('[handleLike] Unexpected error:', error)
    }
  }

  const handlePass = async () => {
    try {
      const currentProfile = profiles[currentCardIndex]
      if (!currentProfile) {
        console.error('[handlePass] No current profile')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('[handlePass] No user found')
        return
      }

      console.log('[handlePass] User passing profile:', { userId: user.id, profileId: currentProfile.id })

      // Record the pass in database
      const result = await recordMatrimonyLike(user.id, currentProfile.id, 'pass')
      
      console.log('[handlePass] Result:', result)

      if (!result.success) {
        console.error('[handlePass] Failed to record pass:', result.error)
      }

      if (currentCardIndex < profiles.length - 1) setCurrentCardIndex((p) => p + 1)
      else setCurrentCardIndex(profiles.length)
    } catch (error) {
      console.error('[handlePass] Unexpected error:', error)
    }
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
                              profileId={profile.id}
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
                              isShortlisted={shortlistedIds.has(profile.id)}
                              onToggleShortlist={() => handleShortlistToggle(profile)}
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
            mode="matrimony"
            onProfileClick={(userId) => {
              // Navigate to profile view if needed
              console.log("Profile clicked:", userId)
            }}
            onMatchClick={async (userId) => {
              // Get matchId from userId - always use matrimony match type in matrimony mode
              const { data: { user } } = await supabase.auth.getUser()
              if (user) {
                const { getMatchId } = await import('@/lib/chatService')
                const matchId = await getMatchId(user.id, userId, 'matrimony')
                if (matchId) {
                  setSelectedChatId(matchId)
                  setCurrentScreen("chat")
                } else {
                  console.error("Could not find matrimony matchId for users:", user.id, userId)
                }
              }
            }}
          />
        </div>
      )}

      {currentScreen === "shortlist" && (
        <div className="p-4 pb-20 mt-2 w-full">
          <div className="flex flex-col h-full relative">
            {/* Static Background */}
            <StaticBackground />
            
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-border glass-apple">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Shortlist</h1>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <MatrimonyShortlistView
                profiles={shortlistedProfiles}
                loading={shortlistLoading}
                onRemove={async (profileId) => {
                  const profile = shortlistedProfiles.find((p) => p.id === profileId)
                  return handleShortlistRemove(profileId, profile?.name)
                }}
                onOpenProfile={(profile) => setShortlistModalProfile(profile)}
              />
            </div>
          </div>
        </div>
      )}

      {currentScreen === "chat" && selectedChatId && (
        <div className="fixed inset-0 z-50 bg-background">
          <ChatScreen 
            matchId={selectedChatId} 
            onBack={() => setCurrentScreen("messages")} 
          />
        </div>
      )}

      {currentScreen === "profile" && (
        <SettingsScreen
          mode="matrimony"
          onNavigate={(id) => {
            if (id === "profile") setCurrentScreen("edit-profile")
            else if (id === "premium") setCurrentScreen("premium")
            else if (id === "verification") setCurrentScreen("verification-status")
          }}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === "edit-profile" && (
        <div className="p-0 pb-0 mt-0">
          <EditProfile
            mode="matrimony"
            onBack={() => setCurrentScreen("profile")}
            onSave={() => {
              // Profile will refresh automatically
              setCurrentScreen("profile")
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

      {/* Match Notification */}
      {showMatchNotification && matchedProfile && (
        <MatchNotification
          match={{
            id: matchedProfile.id,
            name: matchedProfile.name,
            avatar: matchedProfile.photos?.[0] || "/placeholder-user.jpg",
            age: matchedProfile.age,
            mutualInterests: matchedProfile.interests || []
          }}
          onStartChat={() => {
            setShowMatchNotification(false)
            if (matchedMatchId) {
              setSelectedChatId(matchedMatchId)
              setCurrentScreen("chat")
            } else {
              console.error("No matchId available for chat")
            }
          }}
          onKeepSwiping={() => {
            setShowMatchNotification(false)
            setMatchedProfile(null)
            setMatchedMatchId(null)
          }}
          onClose={() => {
            setShowMatchNotification(false)
            setMatchedProfile(null)
            setMatchedMatchId(null)
          }}
        />
      )}

      {shortlistModalProfile && (
        <MatrimonyProfileModal
          profile={shortlistModalProfile}
          open={!!shortlistModalProfile}
          onOpenChange={(open) => {
            if (!open) setShortlistModalProfile(null)
          }}
          onConnect={() => {
            void handleShortlistConnect(shortlistModalProfile)
            setShortlistModalProfile(null)
          }}
          onNotNow={() => {
            void handleShortlistRemove(shortlistModalProfile.id, shortlistModalProfile.name)
            setShortlistModalProfile(null)
          }}
        />
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

      {(currentScreen === "messages" ||
        currentScreen === "activity" ||
        currentScreen === "profile" ||
        currentScreen === "shortlist") && (
        <BackFloatingButton
          onClick={() => {
            if (currentScreen === "shortlist") {
              handleOpenDiscover()
            } else {
              setCurrentScreen("discover")
            }
          }}
        />
      )}

      {currentScreen !== "chat" && (
        <QuickActions
          activeTab={currentScreen}
          onOpenChat={() => setCurrentScreen("messages")}
          onOpenActivity={() => setCurrentScreen("activity")}
          onOpenProfile={() => setCurrentScreen("profile")}
          onDiscover={handleOpenDiscover}
          onOpenShortlist={handleOpenShortlist}
          showShortlist
        />
      )}

      {/* Matrimony Filter Sheet */}
      <MatrimonyFilterSheet 
        open={showFilters} 
        onOpenChange={setShowFilters}
        onApplyFilters={(filters) => {
          setAppliedFilters(filters)
          setCurrentCardIndex(0) // Reset to first card when filters change
        }}
      />
    </AppLayout>
  )
}