"use client"

import { OAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebaseConfig"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function AppleLoginButton() {
  const [isPressed, setIsPressed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const handleAppleLogin = async () => {
    try {
      setIsLoading(true)
      const provider = new OAuthProvider("apple.com")
      const result = await signInWithPopup(auth as any, provider)
      const user = result.user
      console.log("Apple User:", user)
      alert(`Welcome ${user.displayName}!`)
    } catch (error) {
      console.error("Apple Sign-in Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full bg-transparent text-black border-black/20"
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onClick={handleAppleLogin}
    >
      <svg className={`w-4 h-4 mr-2 ${isPressed || isLoading ? 'text-white' : ''}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
       Apple
    </Button>
  )
}


