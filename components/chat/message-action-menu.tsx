"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import type { VerticalPlacement } from "@/components/chat/menu-position"

interface MessageActionMenuProps {
  messageId: string
  messageText: string
  isOwnMessage: boolean
  onReply: () => void
  onCopy: () => void
  onDeleteMe: () => void
  onDeleteEveryone: () => void
  onClose: () => void
  anchor?: "left" | "right"
  anchorElement?: HTMLDivElement | null
  preferredPlacement?: VerticalPlacement
}

const actions = [
  { key: "reply", label: "Reply" },
  { key: "copy", label: "Copy" },
  { key: "deleteMe", label: "Delete for me" },
  { key: "deleteAll", label: "Delete for everyone" },
]

export function MessageActionMenu({
  messageId,
  messageText,
  isOwnMessage,
  onReply,
  onCopy,
  onDeleteMe,
  onDeleteEveryone,
  onClose,
  anchor = "left",
  anchorElement,
  preferredPlacement = "down",
}: MessageActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<VerticalPlacement>(preferredPlacement)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setPlacement(preferredPlacement)
  }, [preferredPlacement])

  const resolvePlacement = useCallback(() => {
    if (typeof window === "undefined") return
    if (!anchorElement) return

    const bubbleRect = anchorElement.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    // Position the menu below the message bubble
    const top = bubbleRect.bottom + scrollTop + 8 // 8px margin
    const left = anchor === "right" 
      ? bubbleRect.right + scrollLeft - 160 // 160px is menu width
      : bubbleRect.left + scrollLeft

    setMenuPosition({ top, left })
  }, [anchorElement, anchor])

  useLayoutEffect(() => {
    resolvePlacement()
  }, [resolvePlacement, messageId])

  useEffect(() => {
    if (!anchorElement) return
    resolvePlacement()

    window.addEventListener("resize", resolvePlacement)
    window.addEventListener("scroll", resolvePlacement, true)

    return () => {
      window.removeEventListener("resize", resolvePlacement)
      window.removeEventListener("scroll", resolvePlacement, true)
    }
  }, [anchorElement, resolvePlacement])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("touchstart", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("touchstart", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  const handleAction = (actionKey: string) => {
    switch (actionKey) {
      case "reply":
        onReply()
        break
      case "copy":
        onCopy()
        break
      case "deleteMe":
        onDeleteMe()
        break
      case "deleteAll":
        if (isOwnMessage) {
          onDeleteEveryone()
        }
        break
      default:
        break
    }
    onClose()
  }

  return createPortal(
    <div
      ref={menuRef}
      data-message-id={messageId}
      data-placement={placement}
      className="fixed z-[9999] min-w-[160px] rounded-2xl border border-white/10 bg-black/80 text-sm text-white shadow-2xl backdrop-blur-lg transition-transform duration-150 ease-out pointer-events-auto animate-in fade-in-0 zoom-in-95"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }}
    >
      <div className="flex flex-col py-1">
        {actions.map((action) => {
          const disabled = action.key === "deleteAll" && !isOwnMessage
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => handleAction(action.key)}
              disabled={disabled}
              className={cn(
                "flex w-full items-center justify-between px-4 py-2 text-left transition-colors",
                "hover:bg-white/10 active:bg-white/20 focus-visible:outline-none disabled:cursor-not-allowed",
                disabled ? "text-white/40" : "text-white",
              )}
            >
              <span>{action.label}</span>
              {action.key === "copy" && <span className="text-xs text-white/60">{messageText.length > 24 ? "…" : ""}</span>}
            </button>
          )
        })}
      </div>
    </div>,
    document.body
  )
}

