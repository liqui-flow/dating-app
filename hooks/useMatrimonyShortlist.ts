"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { MatrimonyProfile } from "@/lib/mockMatrimonyProfiles"
import {
  addToShortlist,
  getShortlistedProfiles,
  removeFromShortlist,
  subscribeToShortlist,
} from "@/lib/matrimonyShortlistService"
import { supabase } from "@/lib/supabaseClient"
import type { ShortlistActionResult } from "@/lib/matrimonyShortlistService"

export function useMatrimonyShortlist() {
  const [userId, setUserId] = useState<string | null>(null)
  const [shortlistedProfiles, setShortlistedProfiles] = useState<MatrimonyProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const shortlistedIds = useMemo(() => new Set(shortlistedProfiles.map((profile) => profile.id)), [shortlistedProfiles])

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      const profiles = await getShortlistedProfiles(userId)
      setShortlistedProfiles(profiles)
      setError(null)
    } catch (err: any) {
      console.error("[useMatrimonyShortlist] refresh failed", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    let isMounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return
      const authUser = data?.user
      if (authUser) {
        setUserId(authUser.id)
      } else {
        setUserId(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    refresh()
    const unsubscribe = subscribeToShortlist(userId, refresh)
    return () => {
      unsubscribe()
    }
  }, [refresh, userId])

  const handleAdd = useCallback(
    async (targetUserId: string, profile?: MatrimonyProfile): Promise<ShortlistActionResult> => {
      if (!userId) return { success: false, error: "User not authenticated" }
      const result = await addToShortlist(targetUserId, userId)
      if (result.success && profile) {
        setShortlistedProfiles((prev) => {
          if (prev.some((p) => p.id === profile.id)) return prev
          return [profile, ...prev]
        })
      }
      return result
    },
    [userId],
  )

  const handleRemove = useCallback(
    async (targetUserId: string): Promise<ShortlistActionResult> => {
      if (!userId) return { success: false, error: "User not authenticated" }
      const result = await removeFromShortlist(targetUserId, userId)
      if (result.success) {
        setShortlistedProfiles((prev) => prev.filter((profile) => profile.id !== targetUserId))
      }
      return result
    },
    [userId],
  )

  const toggleShortlist = useCallback(
    async (profile: MatrimonyProfile): Promise<ShortlistActionResult> => {
      if (shortlistedIds.has(profile.id)) {
        return handleRemove(profile.id)
      }
      return handleAdd(profile.id, profile)
    },
    [handleAdd, handleRemove, shortlistedIds],
  )

  return {
    userId,
    shortlistedProfiles,
    shortlistedIds,
    loading,
    error,
    refresh,
    addProfile: handleAdd,
    removeProfile: handleRemove,
    toggleShortlist,
  }
}

