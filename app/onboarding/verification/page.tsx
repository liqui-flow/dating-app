"use client"
import { useRouter } from "next/navigation"
import { VerificationScreen } from "@/components/onboarding/verification-screen"

export default function VerificationPage() {
  const router = useRouter()
  return (
    <VerificationScreen onComplete={() => router.push("/")} />
  )
}


