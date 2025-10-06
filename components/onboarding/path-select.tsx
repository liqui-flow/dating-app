"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

interface PathSelectProps {
  onSelect: (path: "dating" | "matrimony") => void
  onBack?: () => void
}

export function PathSelect({ onSelect, onBack }: PathSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your Path</CardTitle>
          <CardDescription>Select how you want to continue after verification</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
        <Button
  variant="outline"
  className="h-auto py-6 justify-start text-left group"
  onClick={() => onSelect("dating")}
>
  <div className="flex items-center space-x-4">
    <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center" />
    <div>
      <div className="text-base font-medium">Dating</div>
      <div className="text-xs text-muted-foreground">
        Swipe-based discovery with fun profiles
      </div>
    </div>
  </div>
</Button>



          <Button
            variant="outline"
            className="h-auto py-6 justify-start text-left"
            onClick={() => onSelect("matrimony")}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-medium">Matrimony</div>
                <div className="text-xs text-muted-foreground">Serious profiles with detailed preferences</div>
              </div>
            </div>
          </Button>

          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
