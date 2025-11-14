"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SwipeCard } from "@/components/discovery/swipe-card"
import { FilterSheet } from "@/components/discovery/filter-sheet"
import { ProfileModal } from "@/components/discovery/profile-modal"
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

export function DiscoveryScreen() {
	const [viewMode, setViewMode] = useState<ViewMode>("cards")
	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [showFilters, setShowFilters] = useState(false)
	const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
	const [likedProfiles, setLikedProfiles] = useState<string[]>([])
	const [passedProfiles, setPassedProfiles] = useState<string[]>([])
	const [profiles, setProfiles] = useState<Profile[]>([])
	const [loading, setLoading] = useState(true)

	// Fetch profiles from Supabase
	useEffect(() => {
		async function fetchProfiles() {
			try {
				setLoading(true)

				// Get current user
				const { data: { user } } = await supabase.auth.getUser()
				
				if (!user) {
					setProfiles([])
					setLoading(false)
					return
				}

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
				return
			}

			if (!datingProfiles || datingProfiles.length === 0) {
				setProfiles([])
				setLoading(false)
				return
			}

			// Get user IDs for fetching additional data
			const userIds = datingProfiles.map((p) => p.user_id)

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

			// Combine all data from consolidated table
			const combinedProfiles: Profile[] = datingProfiles
				.map((datingProfile) => {
					// Get dob from dating_profile_full or fallback to user_profiles
					const userProfile = userProfiles?.find((up) => up.user_id === datingProfile.user_id)
					const dob = datingProfile.dob || userProfile?.date_of_birth
					
					// Skip if no dob available
					if (!dob) {
						return null
					}

					// Exclude current user's profile
					if (user && datingProfile.user_id === user.id) {
						return null
					}

					// Get data from consolidated table
					const profilePhotos = (datingProfile.photos as string[]) || []
					const profileInterests = (datingProfile.interests as string[]) || []
					const profileGender = datingProfile.gender || userProfile?.gender
					const profileBio = datingProfile.bio || datingProfile.relationship_goals || "No bio available"
					const verification = verifications?.find((v) => v.user_id === datingProfile.user_id)

					// Filter by gender preference
					if (lookingFor === 'women' && profileGender !== 'female') {
						return null
					}
					if (lookingFor === 'men' && profileGender !== 'male') {
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

				setProfiles(combinedProfiles)
			} catch (error) {
				console.error("Error fetching profiles:", error)
			} finally {
				setLoading(false)
			}
		}

		fetchProfiles()
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

	return (
		<div className="h-screen overflow-hidden flex flex-col">
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

			<div className="p-2 sm:p-4 pb-20 mt-8 sm:mt-10 flex-1 overflow-visible">
				{loading ? (
					<div className="flex items-center justify-center h-[65vh]">
						<div className="text-center space-y-4">
							<div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
							<p className="text-sm text-muted-foreground">Loading profiles...</p>
						</div>
					</div>
				) : viewMode === "cards" ? (
					<div className="space-y-6">
						{/* Card Stack */}
						<div className="relative h-[65vh] sm:h-[70vh] md:h-[600px] flex items-center justify-center transform -translate-y-8 sm:-translate-y-14 md:-translate-y-16 overflow-visible">
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
											<h3 className="text-base sm:text-lg font-semibold">No more profiles</h3>
											<p className="text-xs sm:text-sm text-muted-foreground">
												{profiles.length === 0 
													? "No profiles available. Check back later!" 
													: "Check back later for new matches or adjust your filters"}
											</p>
										</div>
										{profiles.length > 0 && (
											<Button onClick={() => setCurrentCardIndex(0)} className="text-sm">Start Over</Button>
										)}
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				) : null}
			</div>

			{/* Filter Sheet */}
			<FilterSheet open={showFilters} onOpenChange={setShowFilters} />

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