"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PathSelect } from "@/components/onboarding/path-select"
import { supabase } from "@/lib/supabaseClient"
import { saveUserPath } from "@/lib/pathService"
import { goToDating, goToMatrimony } from "@/lib/navigationUtils"

export default function SelectPathPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not authenticated, redirect to auth
          router.push('/auth')
          return
        }

        // User is authenticated, show path selection
        setIsCheckingAuth(false)
      } catch (err) {
        console.error('Error checking auth:', err)
        router.push('/auth')
      }
    }

    checkAuth()
  }, [router])

  const handlePathSelect = async (path: "dating" | "matrimony") => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth')
        return
      }

      // Update the path in the database
      await saveUserPath(user.id, path)

      // Navigate based on onboarding status
      if (path === 'dating') {
        await goToDating(router)
      } else {
        await goToMatrimony(router)
      }
    } catch (error) {
      console.error('Error selecting path:', error)
      // On error, navigate based on path
      if (path === 'dating') {
        await goToDating(router)
      } else {
        await goToMatrimony(router)
      }
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <PathSelect
      onSelect={handlePathSelect}
    />
  )
}

