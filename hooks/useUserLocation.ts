"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getCurrentLocation, watchLocation } from "@/lib/geolocationUtils"
import { updateUserLocation } from "@/lib/datingProfileService"

interface UseUserLocationOptions {
  onSuccess?: (coords: { latitude: number; longitude: number }) => void
  onError?: (message: string) => void
  /**
   * How often to sync to the DB in milliseconds while tracking.
   * Example: 60000 = every 60 seconds. If omitted or <= 0, no periodic sync.
   */
  syncIntervalMs?: number
}

export function useUserLocation(options: UseUserLocationOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)

  const coordsRef = useRef<{ latitude: number; longitude: number } | null>(null)
  const watchStopRef = useRef<(() => void) | null>(null)
  const syncTimerRef = useRef<number | null>(null)

  const requestLocation = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { latitude, longitude } = await getCurrentLocation()
      const result = await updateUserLocation(latitude, longitude)

      if (!result.success) {
        throw new Error(result.error || "Failed to save location")
      }

      const newCoords = { latitude, longitude }
      setLocationEnabled(true)
      setCoords(newCoords)
      coordsRef.current = newCoords
      options.onSuccess?.(newCoords)

      return newCoords
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

  const stopRealtime = useCallback(() => {
    if (watchStopRef.current) {
      watchStopRef.current()
      watchStopRef.current = null
    }
    if (syncTimerRef.current !== null) {
      window.clearInterval(syncTimerRef.current)
      syncTimerRef.current = null
    }
  }, [])

  const startRealtime = useCallback(() => {
    if (watchStopRef.current) return

    const stop = watchLocation(
      ({ latitude, longitude }) => {
        const newCoords = { latitude, longitude }
        setLocationEnabled(true)
        setCoords(newCoords)
        coordsRef.current = newCoords
        options.onSuccess?.(newCoords)
      },
      (message) => {
        setError(message)
        setLocationEnabled(false)
        options.onError?.(message)
      }
    )

    watchStopRef.current = stop

    if (options.syncIntervalMs && options.syncIntervalMs > 0) {
      syncTimerRef.current = window.setInterval(() => {
        const latest = coordsRef.current
        if (!latest) return
        updateUserLocation(latest.latitude, latest.longitude).catch((err) => {
          console.error("Failed to sync user location:", err)
        })
      }, options.syncIntervalMs)
    }
  }, [options])

  useEffect(() => {
    return () => {
      stopRealtime()
    }
  }, [stopRealtime])

  return {
    loading,
    locationEnabled,
    error,
    coords,
    requestLocation,
    startRealtime,
    stopRealtime,
  }
}
