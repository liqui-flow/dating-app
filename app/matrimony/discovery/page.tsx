"use client"

import { MatrimonyMain } from "@/components/matrimony/matrimony-main"

export default function MatrimonyDiscovery() {
  return <MatrimonyMain onExit={() => {
    // Navigate back to home or dating mode
    window.location.href = "/"
  }} />
}

