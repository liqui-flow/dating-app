"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { BackFloatingButton } from "@/components/navigation/back-floating-button"

export function VerificationStatus({ onBack }: { onBack?: () => void }) {
  const [verified, setVerified] = useState(false)
  const [govId, setGovId] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setVerified(true)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Profile Verification</h1>
        {verified ? (
          <Card>
            <CardHeader>
              <CardTitle>You're Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Government ID and selfie have been verified.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Verification Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Upload a government ID and a selfie to verify.</p>
              <Separator />
              <div className="space-y-2">
                <Label>Government ID</Label>
                <Input type="file" accept="image/*" onChange={(e) => setGovId(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-2">
                <Label>Selfie</Label>
                <Input type="file" accept="image/*" onChange={(e) => setSelfie(e.target.files?.[0] || null)} />
              </div>
              <Button onClick={handleUpload} disabled={!govId || !selfie || loading}>
                {loading ? "Uploading..." : "Submit for Verification"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <BackFloatingButton onClick={onBack} />
    </div>
  )
}