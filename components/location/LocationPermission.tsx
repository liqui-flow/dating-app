"use client"

import { useEffect, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useUserLocation } from "@/hooks/useUserLocation"
import { cn } from "@/lib/utils"

interface LocationPermissionProps {
  className?: string
  initiallyEnabled?: boolean
  onEnabled?: () => void
}

export function LocationPermission({ className, initiallyEnabled = false, onEnabled }: LocationPermissionProps) {
  const [enabled, setEnabled] = useState(initiallyEnabled)
  const { toast } = useToast()
  const { requestLocation, loading, startRealtime } = useUserLocation({
    syncIntervalMs: 60000, // sync to DB every 60s while app is open
    onSuccess: () => {
      setEnabled(true)
      toast({
        title: "Location Enabled",
        description: "We will now show matches near you.",
      })
      startRealtime() // Start real-time tracking
      onEnabled?.()
    },
    onError: (message) => {
      toast({
        title: "Location Error",
        description: message,
        variant: "destructive",
      })
    },
  })

  const handleEnable = async () => {
    try {
      await requestLocation()
    } catch {
      // Errors already handled via hook callbacks/toast
    }
  }

  useEffect(() => {
    setEnabled(initiallyEnabled)
  }, [initiallyEnabled])

  if (enabled) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur",
        "dark:bg-white/5 dark:border-white/10",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-white/10 p-2 text-white">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold">Enable Location</p>
            <p className="text-xs text-muted-foreground">
              Turn on location services to filter matches by distance and see how far they are.
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-full"
            onClick={handleEnable}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting location...
              </>
            ) : (
              "Enable location"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

