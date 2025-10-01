"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"

interface MatrimonySwipeCardProps {
  name: string
  age: number
  height?: string
  profession: string
  community?: string
  location: string
  avatar: string
  verified?: boolean
  onConnect: () => void
  onNotNow: () => void
}

export function MatrimonySwipeCard({
  name,
  age,
  height,
  profession,
  community,
  location,
  avatar,
  verified,
  onConnect,
  onNotNow,
}: MatrimonySwipeCardProps) {
  return (
    <Card className="relative w-full max-w-sm h-[60vh] md:h-[480px] overflow-hidden rounded-2xl shadow-xl">
      <img src={avatar} alt={name} className="absolute inset-0 w-full h-full object-cover" />

      {/* Top-right chips (placeholders) */}
      <div className="absolute top-3 right-3 space-y-2 text-white/90">
        <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">⋮</div>
        <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">10</div>
      </div>

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 pt-8 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="flex items-center gap-2 text-white">
          {verified && <Badge className="bg-emerald-500 text-white">✓</Badge>}
          <h3 className="text-xl font-semibold drop-shadow">{name}</h3>
        </div>
        <div className="mt-1 text-sm text-white/90 flex items-center gap-3">
          <span>{age} yrs{height ? `, ${height}` : ""}</span>
        </div>
        <div className="mt-1 text-sm text-white/90 truncate">
          {profession}
        </div>
        <div className="mt-1 text-sm text-white/90 truncate">
          {community ? `${community} · ` : ""}{location}
        </div>

        {/* Action row */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            className="w-14 h-14 rounded-full p-0 border-white/50 text-white/90 bg-white/10 hover:bg-white/20"
            onClick={onNotNow}
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            className="w-14 h-14 rounded-full p-0 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
            onClick={onConnect}
          >
            <Check className="w-7 h-7" />
          </Button>
        </div>
        <div className="mt-2 text-right text-white/90 text-sm">Connect</div>
      </div>
    </Card>
  )
}