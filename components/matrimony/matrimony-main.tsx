"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/layout/app-layout"

interface MatrimonyMainProps {
  onExit?: () => void
}

interface MatrimonyProfile {
  id: string
  name: string
  age: number
  education: string
  profession: string
  location: string
  community?: string
  avatar?: string
}

const SAMPLE_PROFILES: MatrimonyProfile[] = [
  {
    id: "m1",
    name: "Aditi Sharma",
    age: 27,
    education: "MBA, IIM Ahmedabad",
    profession: "Product Manager",
    location: "Bengaluru, India",
    community: "Brahmin",
    avatar: "/professional-woman-smiling.png",
  },
  {
    id: "m2",
    name: "Rahul Mehta",
    age: 30,
    education: "B.Tech, IIT Bombay",
    profession: "Senior Software Engineer",
    location: "Pune, India",
    community: "Vaishya",
    avatar: "/professional-headshot.png",
  },
]

export function MatrimonyMain({ onExit }: MatrimonyMainProps) {
  const [profiles] = useState<MatrimonyProfile[]>(SAMPLE_PROFILES)

  return (
    <AppLayout activeTab="discover" onTabChange={() => {}} showBottomTabs={false}>
      <div className="p-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Matrimony Matches</h2>
            <p className="text-sm text-muted-foreground">Curated profiles aligned with your preferences</p>
          </div>
          {onExit && (
            <Button variant="outline" onClick={onExit}>
              Switch to Dating
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {profiles.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{p.name} • {p.age}</CardTitle>
                <CardDescription>
                  {p.education} • {p.profession} • {p.location}
                  {p.community ? ` • ${p.community}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={p.avatar || "/placeholder-user.jpg"} alt={p.name} className="w-20 h-20 rounded-md object-cover" />
                  <div className="text-sm text-muted-foreground">
                    Looking for a compatible life partner. Family-oriented and career-focused.
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">Shortlist</Button>
                  <Button>Express Interest</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
