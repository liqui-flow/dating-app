"use client"

import { usePathname } from "next/navigation"
import { GlobalBackNavigator } from "@/components/navigation/global-back-navigator"

export function GlobalBackWrapper() {
  const pathname = usePathname()
  const hideOnAuth = pathname?.startsWith("/auth")
  if (hideOnAuth) return null
  return <GlobalBackNavigator />
}