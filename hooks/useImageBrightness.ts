"use client"

import { useState, useEffect, useMemo } from "react"

interface UseImageBrightnessOptions {
  imageUrl: string | null | undefined
  region?: "bottom" | "full"
  bottomPercent?: number // Percentage of bottom to analyze (default 30)
  threshold?: number // Brightness threshold (default 128)
}

interface UseImageBrightnessResult {
  isLight: boolean // true = light background (use dark text), false = dark background (use white text)
  isLoading: boolean
  brightness: number | null // Calculated brightness value (0-255)
}

// Cache to avoid re-analyzing the same image
const brightnessCache = new Map<string, number>()

/**
 * Calculate relative luminance from RGB values
 * Uses the standard relative luminance formula: (r * 299 + g * 587 + b * 114) / 1000
 */
function calculateLuminance(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000
}

/**
 * Analyze image brightness in a specific region
 */
async function analyzeImageBrightness(
  imageUrl: string,
  bottomPercent: number = 30,
  threshold: number = 128
): Promise<number> {
  // Check cache first
  const cacheKey = `${imageUrl}:${bottomPercent}`
  if (brightnessCache.has(cacheKey)) {
    return brightnessCache.get(cacheKey)!
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Downscale for performance (200-300px width is sufficient for analysis)
        const maxWidth = 300
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = Math.floor(img.width * scale)
        canvas.height = Math.floor(img.height * scale)

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Calculate the bottom region to analyze
        const bottomStartY = Math.floor(canvas.height * (1 - bottomPercent / 100))
        const regionHeight = canvas.height - bottomStartY

        // Get image data for the bottom region
        const imageData = ctx.getImageData(0, bottomStartY, canvas.width, regionHeight)
        const pixels = imageData.data

        // Sample pixels efficiently (every 4th pixel for performance)
        let totalLuminance = 0
        let sampleCount = 0

        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const a = pixels[i + 3]

          // Skip transparent or nearly transparent pixels
          if (a < 128) continue

          const luminance = calculateLuminance(r, g, b)
          totalLuminance += luminance
          sampleCount++
        }

        // Calculate average brightness
        const averageBrightness = sampleCount > 0 ? totalLuminance / sampleCount : 0

        // Cache the result
        brightnessCache.set(cacheKey, averageBrightness)

        resolve(averageBrightness)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    img.src = imageUrl
  })
}

/**
 * Hook to analyze image brightness and determine if text should be dark or light
 * 
 * @param options Configuration options
 * @returns Object with isLight (true = use dark text), isLoading, and brightness values
 * 
 * @example
 * const { isLight, isLoading } = useImageBrightness({ imageUrl: profile.photos[0] })
 * const textColor = isLight ? 'text-black' : 'text-white'
 */
export function useImageBrightness({
  imageUrl,
  region = "bottom",
  bottomPercent = 30,
  threshold = 128,
}: UseImageBrightnessOptions): UseImageBrightnessResult {
  const [isLight, setIsLight] = useState(false) // Default to dark background (white text)
  const [isLoading, setIsLoading] = useState(true)
  const [brightness, setBrightness] = useState<number | null>(null)

  // Memoize the analysis to avoid re-running on every render
  const memoizedImageUrl = useMemo(() => imageUrl, [imageUrl])

  useEffect(() => {
    // Reset state if no image URL
    if (!memoizedImageUrl) {
      setIsLight(false) // Default to white text
      setIsLoading(false)
      setBrightness(null)
      return
    }

    // Analyze image brightness
    setIsLoading(true)
    analyzeImageBrightness(memoizedImageUrl, bottomPercent, threshold)
      .then((avgBrightness) => {
        setBrightness(avgBrightness)
        // If average brightness > threshold, background is light (use dark text)
        setIsLight(avgBrightness > threshold)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error analyzing image brightness:", error)
        // Default to white text on error
        setIsLight(false)
        setBrightness(null)
        setIsLoading(false)
      })
  }, [memoizedImageUrl, bottomPercent, threshold])

  return {
    isLight,
    isLoading,
    brightness,
  }
}
