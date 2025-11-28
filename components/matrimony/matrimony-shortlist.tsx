"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading your shortlist...</p>
      </div>
    )
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Star className="w-10 h-10 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No shortlisted profiles yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Tap the star icon on profiles you like to add them to your shortlist and revisit them anytime.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className="relative overflow-hidden bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border border-border/60 shadow-lg hover:shadow-xl transition-all"
          >
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => onOpenProfile?.(profile)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onOpenProfile?.(profile)
                }
              }}
              aria-label={`Open profile for ${profile.name}`}
            />
            <div className="relative z-20 flex gap-4 p-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted shrink-0">
                <Image
                  src={profile.photos?.[0] || "/placeholder-user.jpg"}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold">
                      {profile.name}, {profile.age}
                    </p>
                    {profile.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative z-30 rounded-full border border-border/50 bg-background/80 hover:bg-destructive hover:text-destructive-foreground",
                      removingId === profile.id && "opacity-60 pointer-events-none",
                    )}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleRemove(profile.id)
                    }}
                    aria-label="Remove from shortlist"
                  >
                    {removingId === profile.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {profile.education && (
                  <p className="text-sm text-muted-foreground">{profile.education}</p>
                )}
                {profile.profession && (
                  <p className="text-sm text-muted-foreground">{profile.profession}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
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

