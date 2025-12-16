"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MapPin, Star, Trash2 } from "lucide-react"
import type { MatrimonyProfile } from "@/lib/mockMatrimonyProfiles"
import { cn } from "@/lib/utils"
import { useMatrimonyShortlist } from "@/hooks/useMatrimonyShortlist"
import type { ShortlistActionResult } from "@/lib/matrimonyShortlistService"

interface MatrimonyShortlistViewProps {
  profiles: MatrimonyProfile[]
  loading?: boolean
  onRemove: (profileId: string) => Promise<ShortlistActionResult>
  onOpenProfile?: (profile: MatrimonyProfile) => void
}

export function MatrimonyShortlistView({
  profiles,
  loading,
  onRemove,
  onOpenProfile,
}: MatrimonyShortlistViewProps) {
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (profileId: string) => {
    setRemovingId(profileId)
    await onRemove(profileId)
    setRemovingId(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#97011A]" />
        <p className="text-white text-sm">Loading your shortlist...</p>
      </div>
    )
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Star className="w-10 h-10 text-white/60" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">No shortlisted profiles yet</h3>
          <p className="text-sm text-white/70 max-w-sm">
            Tap the star icon on profiles you like to add them to your shortlist and revisit them anytime.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="bg-[#14161B] border border-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl hover:bg-white/10 transition-all duration-200 cursor-pointer"
          onClick={() => onOpenProfile?.(profile)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onOpenProfile?.(profile)
            }
          }}
          aria-label={`Open profile for ${profile.name}`}
        >
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-12 h-12 border-2 border-white/30">
                <AvatarImage src={profile.photos?.[0] || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="bg-white/20 text-white">{profile.name[0]}</AvatarFallback>
              </Avatar>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-white truncate">
                {profile.name}
                {profile.age && <span className="text-white/70 ml-1">, {profile.age}</span>}
              </h3>
              {profile.location && (
                <p className="text-sm text-white/70 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location}
                </p>
              )}
              {profile.education && (
                <p className="text-sm text-white/70 mt-1">{profile.education}</p>
              )}
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex-shrink-0 rounded-full hover:bg-destructive/20 hover:text-destructive transition-all",
                removingId === profile.id && "opacity-60 pointer-events-none",
              )}
              onClick={(event) => {
                event.stopPropagation()
                handleRemove(profile.id)
              }}
              aria-label="Remove from shortlist"
            >
              {removingId === profile.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Trash2 className="w-4 h-4 text-white" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MatrimonyShortlistScreen({
  onOpenProfile,
  onActionComplete,
}: {
  onOpenProfile?: (profile: MatrimonyProfile) => void
  onActionComplete?: (result: ShortlistActionResult, profileId: string) => void
}) {
  const { shortlistedProfiles, loading, removeProfile } = useMatrimonyShortlist()

  const handleRemove = async (profileId: string) => {
    const result = await removeProfile(profileId)
    onActionComplete?.(result, profileId)
    return result
  }

  return (
    <MatrimonyShortlistView
      profiles={shortlistedProfiles}
      loading={loading}
      onRemove={handleRemove}
      onOpenProfile={onOpenProfile}
    />
  )
}

