"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SwipeCard } from "@/components/discovery/swipe-card"
import { FilterSheet } from "@/components/discovery/filter-sheet"
import { ProfileModal } from "@/components/discovery/profile-modal"
import { DynamicBackground } from "@/components/discovery/dynamic-background"
import { Heart, Filter } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { recordDatingLike, getDatingLikedProfiles } from "@/lib/matchmakingService"
import { MatchNotification } from "@/components/chat/match-notification"
import { LocationPermission } from "@/components/location/LocationPermission"
import { calculateDistance, formatDistance } from "@/lib/geolocationUtils"

// Profile interface
interface Profile {
	id: string
	name: string
	age: number
	location: string
	occupation: string
	education: string
	photos: string[]
	bio: string
	interests: string[]
	religion: string
	verified: boolean
	premium: boolean
	distance: string
	gender?: string
}

type ViewMode = "cards" | "grid"

// Helper function to calculate age from date of birth
function calculateAge(dob: string): number {
	const birthDate = new Date(dob)
	const today = new Date()
	let age = today.getFullYear() - birthDate.getFullYear()
	const monthDiff = today.getMonth() - birthDate.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--
	}
	return age
}

interface DiscoveryScreenProps {
	openFiltersOnMount?: boolean
	onBackToProfile?: () => void
	onStartChat?: (matchId: string) => void
}

export function DiscoveryScreen({ openFiltersOnMount = false, onBackToProfile, onStartChat }: DiscoveryScreenProps = {}) {
	const [viewMode, setViewMode] = useState<ViewMode>("cards")
	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [showFilters, setShowFilters] = useState(openFiltersOnMount)
	const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
	const [likedProfiles, setLikedProfiles] = useState<string[]>([])
	const [passedProfiles, setPassedProfiles] = useState<string[]>([])
	const [profiles, setProfiles] = useState<Profile[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showMatchNotification, setShowMatchNotification] = useState(false)
	const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null)
	const [matchedMatchId, setMatchedMatchId] = useState<string | null>(null)
	const [locationEnabled, setLocationEnabled] = useState(() => {
		if (typeof window === "undefined") {
			return false
		}
		return window.localStorage.getItem("location-enabled") === "true"
	})

	const updateLocationEnabled = (value: boolean) => {
		setLocationEnabled(value)
		if (typeof window !== "undefined") {
			window.localStorage.setItem("location-enabled", value ? "true" : "false")
		}
	}

	// Fetch profiles from Supabase
	const fetchProfiles = async () => {
		try {
			setLoading(true)
			setError(null)
			console.log("Starting to fetch dating profiles...")

			// Get current user
			const { data: { user }, error: authError } = await supabase.auth.getUser()
			
			if (authError) {
				console.error("Auth error:", authError)
				// Check if this is a session missing error (common during logout)
				// If so, silently redirect instead of showing error
				if (authError.message?.includes('session') || authError.message?.includes('Auth session missing')) {
					console.log("Session missing, likely during logout - redirecting silently")
					// Don't set error, just redirect
					window.location.replace('/auth')
					return
				}
				setError(`Authentication error: ${authError.message}`)
				setProfiles([])
				setLoading(false)
				return
			}

			if (!user) {
				console.log("No user found, redirecting to auth...")
				// Don't show error if user is null (could be during logout)
				// Just redirect silently
				window.location.replace('/auth')
				return
			}

			console.log("User authenticated:", user.id)

			// Fetch user's dating preferences from new consolidated table
			const { data: userProfileFull, error: userProfileError } = await supabase
				.from("dating_profile_full")
				.select("preferences, latitude, longitude")
				.eq("user_id", user.id)
				.single()

			if (userProfileError && userProfileError.code !== 'PGRST116') {
				console.error("Error fetching user preferences:", userProfileError)
			}

			// Fetch all dating profiles from new consolidated table
			console.log("Fetching dating profiles from dating_profile_full...")
			// Select only columns that exist - bio might not exist in some databases
			const { data: datingProfiles, error: profilesError } = await supabase
				.from("dating_profile_full")
				.select(`
					user_id,
					name,
					dob,
					gender,
					latitude,
					longitude,
					bio,
					photos,
					interests,
					relationship_goals,
					preferences,
					setup_completed
				`)
				.eq("setup_completed", true)

			if (profilesError) {
				console.error("Error fetching dating profiles:", profilesError)
				console.error("Error details:", {
					message: profilesError.message,
					details: profilesError.details,
					hint: profilesError.hint,
					code: profilesError.code
				})
				setError(`Failed to fetch profiles: ${profilesError.message}. Make sure RLS policies are set up correctly.`)
				setProfiles([])
				setLoading(false)
				return
			}

			console.log(`Found ${datingProfiles?.length || 0} completed dating profiles`)

			if (!datingProfiles || datingProfiles.length === 0) {
				console.log("No completed dating profiles found")
				setError("No profiles found. Make sure there are completed profiles in the database.")
				setProfiles([])
				setLoading(false)
				return
			}

			// Get user IDs for fetching additional data
			const userIds = datingProfiles.map((p) => p.user_id)
			console.log(`Fetching additional data for ${userIds.length} users...`)

			// Fetch user profiles (for date_of_birth if not in dating_profile_full)
			const { data: userProfiles, error: userProfilesError } = await supabase
				.from("user_profiles")
				.select("user_id, date_of_birth, gender")
				.in("user_id", userIds)

			if (userProfilesError) {
				console.error("Error fetching user profiles:", userProfilesError)
			}

			// Fetch ID verifications (for verified status)
			const { data: verifications, error: verificationsError } = await supabase
				.from("id_verifications")
				.select("user_id, verification_status")
				.in("user_id", userIds)

			if (verificationsError) {
				console.error("Error fetching verifications:", verificationsError)
			}

			// Get user's preference for filtering
			const userPrefs = (userProfileFull?.preferences as any) || {}
			const lookingFor = userPrefs.looking_for || 'everyone'
			const minAge = userPrefs.min_age || 18
			const maxAge = userPrefs.max_age || 60
			const maxDistance = userPrefs.max_distance || 100
			const onlyWithPhotos = userPrefs.only_with_photos !== undefined ? userPrefs.only_with_photos : true
			const recentlyActive = userPrefs.recently_active || false
			const verifiedOnly = userPrefs.verified_only || false
			const premiumOnly = userPrefs.premium_only || false
			const educationPrefs = userPrefs.education || []
			const religionPrefs = userPrefs.religion || []
			const lifestylePrefs = userPrefs.lifestyle || []
			const interestsPrefs = userPrefs.interests || []
			const relationshipGoal = userPrefs.relationship_goal || null
			console.log("User looking for:", lookingFor)
			console.log("User preferences object:", userPrefs)

			const userLat = typeof userProfileFull?.latitude === "number" ? userProfileFull.latitude : null
			const userLon = typeof userProfileFull?.longitude === "number" ? userProfileFull.longitude : null
			const hasUserLocation = userLat !== null && userLon !== null
			updateLocationEnabled(hasUserLocation)
			console.log("User location available:", hasUserLocation ? { userLat, userLon } : "No location yet")
			
			// When location is not enabled, be more lenient with filters
			// Don't require photos if location is not available
			const effectiveOnlyWithPhotos = hasUserLocation ? onlyWithPhotos : false
			
			// Log sample of profile genders for debugging
			if (datingProfiles.length > 0) {
				const sampleGenders = datingProfiles.slice(0, 5).map(p => ({
					name: p.name,
					gender: p.gender,
					user_id: p.user_id
				}))
				console.log("Sample profile genders:", sampleGenders)
			}

			// Get already liked/passed profiles to exclude from discovery
			const likedProfileIds = await getDatingLikedProfiles(user.id)
			console.log(`Excluding ${likedProfileIds.length} already liked/passed profiles`)

			// Track filtering reasons for debugging
			let filteredOutNoDob = 0
			let filteredOutCurrentUser = 0
			let filteredOutGender = 0
			let filteredOutAlreadyLiked = 0
			let filteredOutAge = 0
			let filteredOutNoPhotos = 0
			let filteredOutNotVerified = 0
			let filteredOutNotRecent = 0
			let filteredOutRelationshipGoal = 0
			let filteredOutInterests = 0
			let filteredOutDistance = 0

			// Combine all data from consolidated table
			const combinedProfiles: Profile[] = datingProfiles
				.map((datingProfile) => {
					// Get dob from dating_profile_full or fallback to user_profiles
					const userProfile = userProfiles?.find((up) => up.user_id === datingProfile.user_id)
					const dob = datingProfile.dob || userProfile?.date_of_birth
					
					// Skip if no dob available (we need it to calculate age)
					if (!dob) {
						filteredOutNoDob++
						console.log(`Profile ${datingProfile.user_id} (${datingProfile.name}) filtered out: missing date of birth`)
						return null
					}

					// Exclude current user's profile
					if (user && datingProfile.user_id === user.id) {
						filteredOutCurrentUser++
						return null
					}

					// Exclude already liked/passed profiles
					if (likedProfileIds.includes(datingProfile.user_id)) {
						filteredOutAlreadyLiked++
						return null
					}

					// Get data from consolidated table
					const profilePhotos = (datingProfile.photos as string[]) || []
					const profileInterests = (datingProfile.interests as string[]) || []
					const profileGenderRaw = datingProfile.gender || userProfile?.gender
					// Normalize gender to lowercase for consistent comparison
					const profileGender = profileGenderRaw ? profileGenderRaw.toString().toLowerCase() : null
					// Get bio from the profile, fallback to empty string if not available
					const profileBio = (datingProfile as any).bio || ""
					const verification = verifications?.find((v) => v.user_id === datingProfile.user_id)

					// Filter by gender preference (case-insensitive comparison)
					// Normalize lookingFor to match profileGender format
					if (lookingFor === 'women' && profileGender !== 'female') {
						filteredOutGender++
						console.log(`Profile ${datingProfile.user_id} (${datingProfile.name}) filtered out: gender "${profileGenderRaw}" doesn't match preference "women"`)
						return null
					}
					if (lookingFor === 'men' && profileGender !== 'male') {
						filteredOutGender++
						console.log(`Profile ${datingProfile.user_id} (${datingProfile.name}) filtered out: gender "${profileGenderRaw}" doesn't match preference "men"`)
						return null
					}
					// If lookingFor is 'everyone', show all profiles

					// Calculate age for filtering
					const profileAge = calculateAge(dob)

					// Filter by age range
					if (profileAge < minAge || profileAge > maxAge) {
						filteredOutAge++
						return null
					}

					// Filter by photos requirement (only if location is enabled)
					if (effectiveOnlyWithPhotos && profilePhotos.length === 0) {
						filteredOutNoPhotos++
						return null
					}

					// Filter by verified status
					if (verifiedOnly && verification?.verification_status !== "approved") {
						filteredOutNotVerified++
						return null
					}

					// Filter by recently active (if last_active field exists)
					// Note: Using updated_at as proxy for last active
					if (recentlyActive) {
						const lastActive = (datingProfile as any).updated_at
						if (lastActive) {
							const daysSinceActive = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
							if (daysSinceActive > 7) {
								filteredOutNotRecent++
								return null
							}
						} else {
							// If no updated_at, filter out if recently active is required
							filteredOutNotRecent++
							return null
						}
					}

					// Filter by relationship goal
					if (relationshipGoal && relationshipGoal !== "any") {
						const profileGoal = datingProfile.relationship_goals
						if (profileGoal !== relationshipGoal) {
							filteredOutRelationshipGoal++
							return null
						}
					}

					// Filter by interests (at least one match required)
					if (interestsPrefs.length > 0) {
						const hasMatchingInterest = interestsPrefs.some(interest => 
							profileInterests.includes(interest)
						)
						if (!hasMatchingInterest) {
							filteredOutInterests++
							return null
						}
					}

					const profileLat = typeof (datingProfile as any).latitude === "number" ? (datingProfile as any).latitude : null
					const profileLon = typeof (datingProfile as any).longitude === "number" ? (datingProfile as any).longitude : null
					let distanceLabel = ""

					// Only filter by distance if BOTH user and profile have location
					// If location is not enabled, show all profiles regardless of distance
					if (hasUserLocation && userLat !== null && userLon !== null && profileLat !== null && profileLon !== null) {
						const distanceKm = calculateDistance(userLat, userLon, profileLat, profileLon)
						distanceLabel = formatDistance(distanceKm)

						if (distanceKm > maxDistance) {
							filteredOutDistance++
							return null
						}
					}

					// Note: Education, religion, lifestyle, and premium filters cannot be applied
					// because these fields don't exist in the dating_profile_full table schema
					// These filters will be saved but won't affect results until schema is updated

					return {
						id: datingProfile.user_id,
						name: datingProfile.name,
						age: calculateAge(dob),
						gender: profileGender,
						location: "India", // Default location, can be enhanced later
						occupation: "", // Not available in current schema
						education: "", // Not available in current schema
						photos: profilePhotos.length > 0 ? profilePhotos : ["/placeholder-user.jpg"],
						bio: profileBio,
						interests: profileInterests,
						religion: "", // Not available in current schema
						verified: verification?.verification_status === "approved",
						premium: false, // Not available in current schema
						distance: distanceLabel,
					}
				})
				.filter((profile): profile is Profile => profile !== null)

			console.log(`Successfully processed ${combinedProfiles.length} profiles for display`)
			console.log(`Filtering stats: ${filteredOutNoDob} no DOB, ${filteredOutCurrentUser} current user, ${filteredOutGender} gender mismatch, ${filteredOutAlreadyLiked} already liked/passed, ${filteredOutAge} age mismatch, ${filteredOutNoPhotos} no photos, ${filteredOutNotVerified} not verified, ${filteredOutNotRecent} not recent, ${filteredOutRelationshipGoal} relationship goal mismatch, ${filteredOutInterests} interests mismatch, ${filteredOutDistance} beyond max distance`)
			
			setProfiles(combinedProfiles)
			if (combinedProfiles.length === 0) {
				let errorMsg = "No profiles found. "
				if (datingProfiles.length > 0) {
					errorMsg += `Found ${datingProfiles.length} profiles but they were filtered out. `
					if (filteredOutNoDob > 0) {
						errorMsg += `${filteredOutNoDob} missing date of birth. `
					}
					if (filteredOutGender > 0) {
						errorMsg += `${filteredOutGender} don't match your gender preference. `
					}
					if (filteredOutAge > 0) {
						errorMsg += `${filteredOutAge} don't match your age range. `
					}
					if (filteredOutNoPhotos > 0) {
						errorMsg += `${filteredOutNoPhotos} don't have photos. `
					}
					if (filteredOutNotVerified > 0) {
						errorMsg += `${filteredOutNotVerified} are not verified. `
					}
					if (filteredOutNotRecent > 0) {
						errorMsg += `${filteredOutNotRecent} haven't been active recently. `
					}
					if (filteredOutRelationshipGoal > 0) {
						errorMsg += `${filteredOutRelationshipGoal} don't match your relationship goal. `
					}
					if (filteredOutInterests > 0) {
						errorMsg += `${filteredOutInterests} don't match your interests. `
					}
					if (filteredOutDistance > 0) {
						errorMsg += `${filteredOutDistance} are beyond your distance range. `
					}
					errorMsg += "Try adjusting your filters to see more profiles."
				} else {
					errorMsg += "Make sure there are completed profiles in the database."
				}
				setError(errorMsg)
			} else {
				// Clear error if we have profiles
				setError(null)
			}
		} catch (error: any) {
			console.error("Unexpected error fetching profiles:", error)
			setError(`Unexpected error: ${error?.message || "Unknown error"}`)
			setProfiles([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchProfiles()
	}, [])

	// Prevent body scroll when on discover screen
	useEffect(() => {
		document.body.style.overflow = 'hidden'
		document.documentElement.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = ''
			document.documentElement.style.overflow = ''
		}
	}, [])

	const currentProfile = profiles[currentCardIndex]
	const hasMoreProfiles = currentCardIndex < profiles.length

	const handleLike = async (profileId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser()
			if (!user) {
				console.error('[handleLike] No user found')
				return
			}

			console.log('[handleLike] User liking profile:', { userId: user.id, profileId })

			// Record the like in database
			const result = await recordDatingLike(user.id, profileId, 'like')
			
			console.log('[handleLike] Result:', result)

			if (!result.success) {
				console.error('[handleLike] Failed to record like:', result.error)
				// Still update UI to prevent blocking
			}
			
			if (result.success && result.isMatch) {
				console.log('[handleLike] Match detected!', result.matchId)
				// Show match notification
				const matchedProfileData = profiles.find(p => p.id === profileId)
				if (matchedProfileData && result.matchId) {
					setMatchedProfile(matchedProfileData)
					setMatchedMatchId(result.matchId)
					setShowMatchNotification(true)
				}
			}

			setLikedProfiles((prev) => [...prev, profileId])
			if (currentCardIndex < profiles.length - 1) {
				setCurrentCardIndex((prev) => prev + 1)
			}
		} catch (error) {
			console.error('[handleLike] Unexpected error:', error)
		}
	}

	const handlePass = async (profileId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser()
			if (!user) {
				console.error('[handlePass] No user found')
				return
			}

			console.log('[handlePass] User passing profile:', { userId: user.id, profileId })

			// Record the pass in database
			const result = await recordDatingLike(user.id, profileId, 'pass')
			
			console.log('[handlePass] Result:', result)

			if (!result.success) {
				console.error('[handlePass] Failed to record pass:', result.error)
			}

			setPassedProfiles((prev) => [...prev, profileId])
			if (currentCardIndex < profiles.length - 1) {
				setCurrentCardIndex((prev) => prev + 1)
			}
		} catch (error) {
			console.error('[handlePass] Unexpected error:', error)
		}
	}

	const handleRewind = () => {
		if (currentCardIndex > 0) {
			setCurrentCardIndex((prev) => prev - 1)
			// Remove from liked/passed arrays
			const prevProfile = profiles[currentCardIndex - 1]
			setLikedProfiles((prev) => prev.filter((id) => id !== prevProfile.id))
			setPassedProfiles((prev) => prev.filter((id) => id !== prevProfile.id))
		}
	}

	// Get current profile's first photo for background
	const currentProfileImage = currentProfile?.photos?.[0] || null

	return (
		<div className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col relative bg-[#0E0F12]">
			{/* Dynamic Background */}
			<DynamicBackground imageUrl={currentProfileImage} />

			{!locationEnabled && (
				<div className="fixed top-14 left-0 right-0 z-40 px-4 sm:px-6">
					<LocationPermission
						initiallyEnabled={locationEnabled}
						onEnabled={() => {
							updateLocationEnabled(true)
							fetchProfiles()
						}}
						className="mx-auto max-w-md shadow-lg"
					/>
				</div>
			)}
			
			{/* Floating header elements */}
			<div className="fixed top-3 left-4 z-40 text-lg sm:text-xl font-bold bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-1.5 rounded-lg shadow-lg">
				<span style={{ color: '#FFFFFF' }}>For you</span>
			</div>
			<div className="fixed top-3 right-3 z-40">
				<Button
					variant="secondary"
					size="sm"
					className="rounded-full px-3 py-2 sm:px-4 sm:py-3 shadow-md bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20"
					onClick={() => setShowFilters(true)}
					style={{ color: '#FFFFFF' }}
				>
					<Filter className="w-4 h-4" style={{ color: '#FFFFFF' }} />
				</Button>
			</div>

			<div className="flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-4">
				{loading ? (
					<div className="flex items-center justify-center h-full w-full">
						<div className="text-center space-y-4 bg-[#14161B] backdrop-blur-sm p-6 rounded-xl shadow-lg">
							<div className="w-12 h-12 mx-auto border-4 border-[#97011A] border-t-transparent rounded-full animate-spin" />
							<p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Loading profiles...</p>
						</div>
					</div>
				) : viewMode === "cards" ? (
					<div className="w-full h-full flex items-center justify-center">
						{/* Card Stack */}
						<div className="relative w-full max-w-xs sm:max-w-sm h-full flex items-center justify-center overflow-hidden">
							{hasMoreProfiles && profiles.length > 0 ? (
								<div className="relative w-full max-w-xs sm:max-w-sm h-full overflow-visible">
									{profiles
										.slice(currentCardIndex, Math.min(currentCardIndex + 4, profiles.length))
										.map((profile, index) => (
											<div key={profile.id} className="absolute inset-0 flex items-center justify-center">
												<SwipeCard
													profile={profile}
													stackIndex={index}
													onLike={index === 0 ? () => handleLike(profile.id) : () => {}}
													onPass={index === 0 ? () => handlePass(profile.id) : () => {}}
													onProfileClick={() => setSelectedProfile(profile)}
												/>
											</div>
										))}
								</div>
							) : (
								<Card className="w-full max-w-xs sm:max-w-sm h-80 sm:h-96 flex items-center justify-center bg-[#14161B] shadow-[0_8px_32px_rgba(0,0,0,0.12)]" style={{ color: '#FFFFFF' }}>
									<CardContent className="text-center space-y-4 p-4 sm:p-6" style={{ color: '#FFFFFF' }}>
										<div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
											<Heart className="w-6 h-6 sm:w-8 sm:h-8 text-[#97011A]" />
										</div>
										<div className="space-y-2">
											<h3 className="text-base sm:text-lg font-bold" style={{ color: '#FFFFFF' }}>
												{error ? "Error loading profiles" : "No more profiles"}
											</h3>
											<p className="text-xs sm:text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
												{error || (profiles.length === 0 
													? "No profiles available. Check back later!" 
													: "Check back later for new matches or adjust your filters")}
											</p>
											{error && (
												<p className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
													Check browser console (F12) for more details
												</p>
											)}
										</div>
										<div className="flex gap-2 justify-center">
											{profiles.length > 0 && (
												<Button onClick={() => setCurrentCardIndex(0)} className="text-sm bg-[#97011A] hover:bg-[#7A0115]" style={{ color: '#FFFFFF' }}>Start Over</Button>
											)}
											{error && (
												<Button onClick={fetchProfiles} className="text-sm bg-[#97011A] hover:bg-[#7A0115]" style={{ color: '#FFFFFF' }}>Retry</Button>
											)}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				) : null}
			</div>

			{/* Filter Sheet */}
			<FilterSheet 
				open={showFilters} 
				onOpenChange={(open) => {
					setShowFilters(open)
					// If closing and we came from settings, go back to profile
					if (!open && openFiltersOnMount && onBackToProfile) {
						onBackToProfile()
					}
				}}
				onFiltersSaved={fetchProfiles}
			/>

			{/* Profile Modal */}
			{selectedProfile && (
				<ProfileModal
					profile={selectedProfile}
					open={!!selectedProfile}
					onOpenChange={() => setSelectedProfile(null)}
					onLike={() => {
						handleLike(selectedProfile.id)
						setSelectedProfile(null)
					}}
					onPass={() => {
						handlePass(selectedProfile.id)
						setSelectedProfile(null)
					}}
				/>
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
					if (matchedMatchId && onStartChat) {
						onStartChat(matchedMatchId)
					} else {
						console.log("Start chat with matchId:", matchedMatchId)
					}
				}}
					onKeepSwiping={() => {
						setShowMatchNotification(false)
						setMatchedProfile(null)
					}}
					onClose={() => {
						setShowMatchNotification(false)
						setMatchedProfile(null)
					}}
				/>
			)}
		</div>
	)
}