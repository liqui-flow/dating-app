'use client'

import { useMessageNotifications } from '@/hooks/useMessageNotifications'

/**
 * Global component that listens for messages and shows toast notifications
 * when the user is not on the chat screen
 */
export function GlobalMessageListener() {
  useMessageNotifications({
    currentMatchId: null,
    currentPage: 'other',
  })

  return null // This component doesn't render anything
}

