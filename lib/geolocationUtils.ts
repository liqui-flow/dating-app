const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number) => degrees * (Math.PI / 180)

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers rounded to one decimal place.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanceKm = EARTH_RADIUS_KM * c

  return Math.round(distanceKm * 10) / 10
}

/**
 * Format a distance value for display.
 */
export function formatDistance(distanceKm: number): string {
  if (Number.isNaN(distanceKm)) {
    return ''
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`
  }

  return `${distanceKm} km away`
}

/**
 * Request the user's current coordinates via the browser Geolocation API.
 */
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Start watching the user's location for real-time updates.
 * Returns a cleanup function that stops watching when called.
 */
export function watchLocation(
  onUpdate: (coords: { latitude: number; longitude: number }) => void,
  onError?: (message: string) => void
): () => void {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    onError?.('Geolocation is not supported by this browser')
    return () => {}
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    },
    (error) => {
      onError?.(error?.message || 'Unable to track location')
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    }
  )

  return () => {
    navigator.geolocation.clearWatch(watchId)
  }
}


