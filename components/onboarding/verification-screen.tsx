"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, Shield, CheckCircle } from "lucide-react"

interface VerificationScreenProps {
  onComplete?: () => void
}

export function VerificationScreen({ onComplete }: VerificationScreenProps) {
  const [step, setStep] = useState<"phone" | "photo" | "id">("phone")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePhoneVerification = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setPhoneVerified(true)
    setIsLoading(false)
    setStep("photo")
  }

  const handlePhotoUpload = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setPhotoUploaded(true)
    setIsLoading(false)
    setStep("id")
  }

  const handleComplete = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    onComplete?.()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Account</CardTitle>
          <CardDescription>Help us keep Lovesathi safe and authentic for everyone</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  phoneVerified ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {phoneVerified ? <CheckCircle className="w-4 h-4" /> : "1"}
              </div>
              <span className="text-sm">Phone</span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  photoUploaded
                    ? "bg-primary text-primary-foreground"
                    : step === "photo"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {photoUploaded ? <CheckCircle className="w-4 h-4" /> : "2"}
              </div>
              <span className="text-sm">Photo</span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "id" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="text-sm">ID</span>
            </div>
          </div>

          {/* Phone Verification */}
          {step === "phone" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Verify Phone Number</h3>
                <p className="text-sm text-muted-foreground">We'll send you a verification code</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <Button onClick={handlePhoneVerification} className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Phone"}
                </Button>

                <Button variant="link" className="w-full text-sm">
                  Resend Code
                </Button>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          {step === "photo" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Upload Your Photo</h3>
                <p className="text-sm text-muted-foreground">Add a clear photo of yourself to get started</p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload a photo</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG up to 10MB</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Upload className="w-4 h-4 mr-2" />
                    Gallery
                  </Button>
                </div>
              </div>

              <Button onClick={handlePhotoUpload} className="w-full" disabled={isLoading}>
                {isLoading ? "Uploading..." : "Continue"}
              </Button>
            </div>
          )}

          {/* ID Verification */}
          {step === "id" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">ID Verification</h3>
                <p className="text-sm text-muted-foreground">Optional but recommended for enhanced trust</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Why verify your ID?</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Get a verified badge on your profile</li>
                        <li>• Increase trust with potential matches</li>
                        <li>• Access premium features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 bg-transparent">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Upload ID</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 bg-transparent">
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">Take Photo</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleComplete} className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Verify ID"}
                  </Button>

                  <Button variant="ghost" onClick={handleComplete} className="w-full text-muted-foreground">
                    Skip for now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
