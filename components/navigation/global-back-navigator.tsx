"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

/**
 * GlobalBackNavigator adds:
 * - A floating back button (top-left) that calls browser history back.
 * - Swipe-right gesture to navigate back.
 * It does not interfere with existing navigation logic.
 */
export function GlobalBackNavigator() {
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const moved = useRef<boolean>(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const update = () => setShowButton(typeof window !== "undefined" && window.history.length > 1)
    update()
    window.addEventListener("popstate", update)
    return () => window.removeEventListener("popstate", update)
  }, [])

  useEffect(() => {
    const EDGE_ALLOW_PX = 32 // Enable from screen edge to feel native on iOS
    const MIN_X_DELTA = 60
    const MAX_Y_DELTA = 40

    const onStart = (x: number, y: number) => {
      startX.current = x
      startY.current = y
      moved.current = false
    }

    const onMove = (x: number, y: number) => {
      if (startX.current == null || startY.current == null) return
      const dx = x - startX.current
      const dy = y - startY.current
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        moved.current = true
      }
      // Optional: If starting near left edge and moving right, hint back by preventing overscroll
      // We avoid preventDefault to not break scrolling; just tracking is enough
    }

    const onEnd = (x: number, y: number) => {
      if (startX.current == null || startY.current == null) return
      const dx = x - startX.current
      const dy = y - startY.current
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      const startedAtEdge = startX.current <= EDGE_ALLOW_PX
      const isHorizontal = absDx > MIN_X_DELTA && absDy < MAX_Y_DELTA

      if (isHorizontal && dx > 0 && (startedAtEdge || moved.current)) {
        goBackSafe()
      }

      startX.current = null
      startY.current = null
      moved.current = false
    }

    // Touch events (iOS Safari)
    const tStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      onStart(t.clientX, t.clientY)
    }
    const tMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      onMove(t.clientX, t.clientY)
    }
    const tEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      onEnd(t.clientX, t.clientY)
    }

    // Pointer events (Android/desktop trackpads)
    const pDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.buttons !== 1) return
      onStart(e.clientX, e.clientY)
    }
    const pMove = (e: PointerEvent) => onMove(e.clientX, e.clientY)
    const pUp = (e: PointerEvent) => onEnd(e.clientX, e.clientY)

    document.addEventListener("touchstart", tStart, { passive: true, capture: true })
    document.addEventListener("touchmove", tMove, { passive: true, capture: true })
    document.addEventListener("touchend", tEnd, { passive: true, capture: true })

    document.addEventListener("pointerdown", pDown, { passive: true, capture: true })
    document.addEventListener("pointermove", pMove, { passive: true, capture: true })
    document.addEventListener("pointerup", pUp, { passive: true, capture: true })

    return () => {
      document.removeEventListener("touchstart", tStart, { capture: true } as any)
      document.removeEventListener("touchmove", tMove, { capture: true } as any)
      document.removeEventListener("touchend", tEnd, { capture: true } as any)

      document.removeEventListener("pointerdown", pDown, { capture: true } as any)
      document.removeEventListener("pointermove", pMove, { capture: true } as any)
      document.removeEventListener("pointerup", pUp, { capture: true } as any)
    }
  }, [])

  const goBackSafe = () => {
    try {
      const escEvent = new KeyboardEvent("keydown", { key: "Escape" })
      window.dispatchEvent(escEvent)
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.history.back()
        }
      }, 0)
    } catch {}
  }

  if (!showButton) return null

  return (
    <div className="fixed top-3 left-3 z-50">
      <Button
        variant="outline"
        size="icon"
        aria-label="Back"
        onClick={goBackSafe}
        style={{ borderRadius: 9999 }}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
    </div>
  )
}
