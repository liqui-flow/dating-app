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
}

export function DiscoveryScreen({ openFiltersOnMount = false, onBackToProfile }: DiscoveryScreenProps = {}) {
	const [viewMode, setViewMode] = useState<ViewMode>("cards")
	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [showFilters, setShowFilters] = useState(openFiltersOnMount)
	const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
	const [likedProfiles, setLikedProfiles] = useState<string[]>([])
	const [passedProfiles, setPassedProfiles] = useState<string[]>([])
	const [profiles, setProfiles] = useState<Profile[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

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
				.select("preferences")
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
			console.log("User looking for:", lookingFor)
			console.log("User preferences object:", userPrefs)
			
			// Log sample of profile genders for debugging
			if (datingProfiles.length > 0) {
				const sampleGenders = datingProfiles.slice(0, 5).map(p => ({
					name: p.name,
					gender: p.gender,
					user_id: p.user_id
				}))
				console.log("Sample profile genders:", sampleGenders)
			}

			// Track filtering reasons for debugging
			let filteredOutNoDob = 0
			let filteredOutCurrentUser = 0
			let filteredOutGender = 0

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
						distance: "", // Not available in current schema
					}
				})
				.filter((profile): profile is Profile => profile !== null)

			console.log(`Successfully processed ${combinedProfiles.length} profiles for display`)
			console.log(`Filtering stats: ${filteredOutNoDob} no DOB, ${filteredOutCurrentUser} current user, ${filteredOutGender} gender mismatch`)
			
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
					errorMsg += "Make sure there are completed profiles in the database."
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

	const handleLike = (profileId: string) => {
		setLikedProfiles((prev) => [...prev, profileId])
		if (currentCardIndex < profiles.length - 1) {
			setCurrentCardIndex((prev) => prev + 1)
		}
	}

	const handlePass = (profileId: string) => {
		setPassedProfiles((prev) => [...prev, profileId])
		if (currentCardIndex < profiles.length - 1) {
			setCurrentCardIndex((prev) => prev + 1)
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
		<div className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col relative">
			{/* Dynamic Background */}
			<DynamicBackground imageUrl={currentProfileImage} />
			
			{/* Floating header elements */}
			<div className="fixed top-3 left-4 z-40 text-lg sm:text-xl font-semibold">For you</div>
			<div className="fixed top-3 right-3 z-40">
				<Button
					variant="secondary"
					size="sm"
					className="rounded-full px-3 py-2 sm:px-4 sm:py-3 shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
					onClick={() => setShowFilters(true)}
				>
					<Filter className="w-4 h-4" />
				</Button>
			</div>

			<div className="flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-4">
				{loading ? (
					<div className="flex items-center justify-center h-full w-full">
						<div className="text-center space-y-4">
							<div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
							<p className="text-sm text-muted-foreground">Loading profiles...</p>
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
								<Card className="w-full max-w-xs sm:max-w-sm h-80 sm:h-96 flex items-center justify-center">
									<CardContent className="text-center space-y-4 p-4 sm:p-6">
										<div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
											<Heart className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
										</div>
										<div className="space-y-2">
											<h3 className="text-base sm:text-lg font-semibold">
												{error ? "Error loading profiles" : "No more profiles"}
											</h3>
											<p className="text-xs sm:text-sm text-muted-foreground">
												{error || (profiles.length === 0 
													? "No profiles available. Check back later!" 
													: "Check back later for new matches or adjust your filters")}
											</p>
											{error && (
												<p className="text-xs text-muted-foreground mt-2">
													Check browser console (F12) for more details
												</p>
											)}
										</div>
										<div className="flex gap-2 justify-center">
											{profiles.length > 0 && (
												<Button onClick={() => setCurrentCardIndex(0)} className="text-sm">Start Over</Button>
											)}
											{error && (
												<Button onClick={fetchProfiles} className="text-sm">Retry</Button>
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
		</div>
	)
}