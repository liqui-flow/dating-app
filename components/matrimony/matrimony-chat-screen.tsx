"use client"

import { ChatScreen } from "@/components/chat/chat-screen"

interface MatrimonyChatScreenProps {
  chatId: string
  onBack: () => void
}

export function MatrimonyChatScreen({ chatId, onBack }: MatrimonyChatScreenProps) {
  return <ChatScreen matchId={chatId} onBack={onBack} />
}
