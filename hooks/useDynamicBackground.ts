"use client"

import { useState, useEffect, useCallback } from "react"
import { extractDominantColors, generateRadialGradient, type ColorPalette } from "@/lib/colorExtraction"

interface UseDynamicBackgroundOptions {
  imageUrl: string | null | undefined
  enabled?: boolean
}

interface DynamicBackgroundState {
  gradient: string
  palette: ColorPalette | null
  isLoading: boolean
  error: Error | null
}

const defaultGradient = "radial-gradient(ellipse at center, rgba(100, 100, 120, 0.3) 0%, rgba(0, 0, 0, 0.4) 100%)"

export function useDynamicBackground({
  imageUrl,
  enabled = true,
}: UseDynamicBackgroundOptions): DynamicBackgroundState {
  const [state, setState] = useState<DynamicBackgroundState>({
    gradient: defaultGradient,
    palette: null,
    isLoading: false,
    error: null,
  })

  const updateBackground = useCallback(async (url: string) => {
    if (!enabled || !url) {
      setState({
        gradient: defaultGradient,
        palette: null,
        isLoading: false,
        error: null,
      })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const palette = await extractDominantColors(url, 3)
      const gradient = generateRadialGradient(palette)

      setState({
        gradient,
        palette,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error("Failed to extract colors from image:", error)
      setState({
        gradient: defaultGradient,
        palette: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      })
    }
  }, [enabled])

  useEffect(() => {
    if (imageUrl) {
      updateBackground(imageUrl)
    } else {
      setState({
        gradient: defaultGradient,
        palette: null,
        isLoading: false,
        error: null,
      })
    }
  }, [imageUrl, updateBackground])

  return state
}

