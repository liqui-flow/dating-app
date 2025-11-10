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
				
				// Fetch dating profiles with related data
				const { data: datingProfiles, error: profilesError } = await supabase
					.from("dating_profiles")
					.select(`
						user_id,
						name,
						video_url
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

				// Get user IDs
				const userIds = datingProfiles.map((p) => p.user_id)

				// Fetch user profiles (for dob and gender)
				const { data: userProfiles, error: userProfilesError } = await supabase
					.from("user_profiles")
					.select("user_id, date_of_birth, gender")
					.in("user_id", userIds)

				if (userProfilesError) {
					console.error("Error fetching user profiles:", userProfilesError)
				}

				// Fetch profile photos
				const { data: photos, error: photosError } = await supabase
					.from("profile_photos")
					.select("user_id, photo_url, display_order, is_primary")
					.in("user_id", userIds)
					.order("display_order", { ascending: true })

				if (photosError) {
					console.error("Error fetching photos:", photosError)
				}

				// Fetch interests
				const { data: interests, error: interestsError } = await supabase
					.from("profile_interests")
					.select("user_id, interest_name")
					.in("user_id", userIds)

				if (interestsError) {
					console.error("Error fetching interests:", interestsError)
				}

				// Fetch relationship goals (for bio)
				const { data: goals, error: goalsError } = await supabase
					.from("relationship_goals")
					.select("user_id, goal_description")
					.in("user_id", userIds)

				if (goalsError) {
					console.error("Error fetching goals:", goalsError)
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
				const combinedProfiles: Profile[] = datingProfiles
					.map((datingProfile) => {
						const userProfile = userProfiles?.find((up) => up.user_id === datingProfile.user_id)
						const userPhotos = photos?.filter((p) => p.user_id === datingProfile.user_id).map((p) => p.photo_url) || []
						const userInterests = interests?.filter((i) => i.user_id === datingProfile.user_id).map((i) => i.interest_name) || []
						const userGoal = goals?.find((g) => g.user_id === datingProfile.user_id)
						const verification = verifications?.find((v) => v.user_id === datingProfile.user_id)

						// Skip if no user profile data (no dob)
						if (!userProfile || !userProfile.date_of_birth) {
							return null
						}

						// Exclude current user's profile
						if (user && datingProfile.user_id === user.id) {
							return null
						}

						return {
							id: datingProfile.user_id,
							name: datingProfile.name,
							age: calculateAge(userProfile.date_of_birth),
							gender: userProfile.gender,
							location: "India", // Default location, can be enhanced later
							occupation: "", // Not available in current schema
							education: "", // Not available in current schema
							photos: userPhotos.length > 0 ? userPhotos : ["/placeholder-user.jpg"],
							bio: userGoal?.goal_description || "No bio available",
							interests: userInterests,
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
		<div className="h-screen overflow-hidden bg-background flex flex-col">
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