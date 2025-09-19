"use client"

import { useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { AppMain } from "@/components/app-main"

export default function Home() {
  const [appState, setAppState] = useState<"splash" | "main">("splash")

  const handleOnboardingComplete = () => {
    setAppState("main")
  }

  if (appState === "splash") {
    return <SplashScreen onComplete={handleOnboardingComplete} />
  }

  return <AppMain />
}
