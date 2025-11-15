"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { BackFloatingButton } from "@/components/navigation/back-floating-button"
import { StaticBackground } from "@/components/discovery/static-background"

export function PremiumFeatures({ onBack }: { onBack?: () => void }) {
  const features = [
    "Message Before Matching",
    "Rematch with Expired Connections",
    "Unlimited Likes/Swipes",
  ]

  return (
    <div className="flex flex-col h-full relative">
      <StaticBackground />
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Your Premium Features</h1>
        <Card>
          <CardHeader>
            <CardTitle>Included Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map((f) => (
              <div key={f} className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>{f}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <BackFloatingButton onClick={onBack} />
    </div>
  )
}