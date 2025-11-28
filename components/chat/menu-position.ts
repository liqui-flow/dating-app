export type VerticalPlacement = "up" | "down"

interface PlacementInput {
  bubbleRect: DOMRect
  viewportHeight: number
}

/**
 * Determines whether a contextual menu should open above or below the bubble.
 * Uses bubble center vs viewport midpoint to keep the popup within view.
 */
export function getPreferredVerticalPlacement({ bubbleRect, viewportHeight }: PlacementInput): VerticalPlacement {
  const bubbleCenter = bubbleRect.top + bubbleRect.height / 2
  const viewportMidpoint = viewportHeight / 2

  return bubbleCenter < viewportMidpoint ? "down" : "up"
}


