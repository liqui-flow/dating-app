"use client"

import { useCallback, useState } from "react"
import { getCurrentLocation } from "@/lib/geolocationUtils"
import { updateUserLocation } from "@/lib/datingProfileService"

interface UseUserLocationOptions {
  onSuccess?: (coords: { latitude: number; longitude: number }) => void
  onError?: (message: string) => void
}

export function useUserLocation(options: UseUserLocationOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { latitude, longitude } = await getCurrentLocation()
      const result = await updateUserLocation(latitude, longitude)

      if (!result.success) {
        throw new Error(result.error || "Failed to save location")
      }

      setLocationEnabled(true)
      options.onSuccess?.({ latitude, longitude })

      return { latitude, longitude }
    } catch (err: any) {
      const message = err?.message || "Unable to fetch location"
      setError(message)
      setLocationEnabled(false)
      options.onError?.(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [options])

  return {
    loading,
    locationEnabled,
    error,
    requestLocation,
  }
}

