"use client"

import { useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { AppMain } from "@/components/app-main"
import { MatrimonyMain } from "@/components/matrimony/matrimony-main"

type AppMode = "dating" | "matrimony"
	export default function Home() {
  const [appState, setAppState] = useState<"splash" | "main">("splash")
  const [mode, setMode] = useState<AppMode>("dating")

  const handleOnboardingComplete = (selectedMode?: AppMode) => {
    if (selectedMode) setMode(selectedMode)
    setAppState("main")
  }

  if (appState === "splash") {
    return <SplashScreen onComplete={handleOnboardingComplete} />
  }

  if (mode === "matrimony") {
    return <MatrimonyMain onExit={() => setMode("dating")} />
  }

  return <AppMain />
}
