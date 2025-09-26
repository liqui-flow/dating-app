"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, CheckCircle, Upload, Camera } from "lucide-react"

interface VerificationScreenProps {
  onComplete?: () => void
}

export function VerificationScreen({ onComplete }: VerificationScreenProps) {
  const [step, setStep] = useState<"contact" | "profile" | "id">("contact")
  const [verificationMethod, setVerificationMethod] = useState<"phone" | "email">("phone")
  const [contactValue, setContactValue] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [contactVerified, setContactVerified] = useState(false)
  const [gender, setGender] = useState<"male" | "female" | null>(null)
  const [dob, setDob] = useState("")
  const [profileValid, setProfileValid] = useState(false)
  const [underageMessage, setUnderageMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [showCameraOverlay, setShowCameraOverlay] = useState(false)

  const handleUploadId = () => {
    // Works on Web (desktop/mobile) and mobile browsers on Android/iOS
    uploadInputRef.current?.click()
  }

  const handleTakePhoto = async () => {
    // Mobile hint: try to force camera on supported mobile browsers
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
    const isMobile = /iphone|ipad|ipod|android/i.test(ua)

    if (cameraInputRef.current) {
      // Set attributes defensively for broadest support
      cameraInputRef.current.setAttribute("accept", "image/*;capture=camera")
      cameraInputRef.current.setAttribute("capture", "environment")
    }

    if (isMobile) {
      cameraInputRef.current?.click()
      return
    }

    // Try opening desktop/laptop camera using MediaDevices
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        mediaStreamRef.current = stream
        setShowCameraOverlay(true)
        // Defer attaching to next paint
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(() => {})
          }
        }, 0)
        return
      }
    } catch (err) {
      // Permission denied or not available; fall back below
    }

    // Fallback: open file picker
    uploadInputRef.current?.click()
  }

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    setShowCameraOverlay(false)
  }

  const handleCaptureFrame = async () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: blob.type })
        console.log("Captured photo file:", file.name)
        // Integrate like upload flow if needed
      }
      stopCamera()
    }, "image/jpeg", 0.92)
  }

  const handleSendCode = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setCodeSent(true)
  }

  const handleVerifyCode = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsLoading(false)
    setContactVerified(true)
    setStep("profile")
  }

  const calculateAge = (dateString: string) => {
    const today = new Date()
    const birth = new Date(dateString)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleProfileContinue = () => {
    setUnderageMessage(null)
    const age = dob ? calculateAge(dob) : 0
    // Treat below 17 as underage per requirement
    if (age < 17) {
      setUnderageMessage("You're underage to use a dating app.")
      setProfileValid(false)
      return
    }
    if (gender && dob) {
      setProfileValid(true)
      setStep("id")
    }
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
                  contactVerified ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {contactVerified ? <CheckCircle className="w-4 h-4" /> : "1"}
              </div>
              <span className="text-sm">Contact</span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  profileValid || step === "id"
                    ? "bg-primary text-primary-foreground"
                    : step === "profile"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {profileValid ? <CheckCircle className="w-4 h-4" /> : "2"}
              </div>
              <span className="text-sm">Details</span>
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

          {/* Contact Verification (Phone or Email) */}
          {step === "contact" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Verify Your Contact</h3>
                <p className="text-sm text-muted-foreground">Choose phone or email and we'll send you a code</p>
              </div>

              <div className="space-y-4">
                {/* Method selector */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={verificationMethod === "phone" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setVerificationMethod("phone")}
                  >
                    Phone
                  </Button>
                  <Button
                    variant={verificationMethod === "email" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setVerificationMethod("email")}
                  >
                    Email
                  </Button>
                </div>

                {/* Destination input */}
                <div className="space-y-2">
                  <Label htmlFor="contact-value">{verificationMethod === "phone" ? "Phone Number" : "Email"}</Label>
                  <Input
                    id="contact-value"
                    type={verificationMethod === "phone" ? "tel" : "email"}
                    placeholder={verificationMethod === "phone" ? "Enter your phone number" : "Enter your email"}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                  />
                </div>

                {!codeSent && (
                  <Button onClick={handleSendCode} className="w-full" disabled={isLoading || !contactValue}>
                    {isLoading ? "Sending..." : "Send Code"}
                  </Button>
                )}

                {codeSent && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <Input
                        id="verification-code"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>

                    <Button onClick={handleVerifyCode} className="w-full" disabled={isLoading || verificationCode.length < 4}>
                      {isLoading ? "Verifying..." : "Verify"}
                    </Button>

                    <Button variant="link" className="w-full text-sm" onClick={handleSendCode} disabled={isLoading}>
                      Resend Code
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile step (DOB + Gender) */}
          {step === "profile" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Your Basic Details</h3>
                <p className="text-sm text-muted-foreground">Add your date of birth and gender</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={gender === "male" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setGender("male")}
                    >
                      Male
                    </Button>
                    <Button
                      type="button"
                      variant={gender === "female" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setGender("female")}
                    >
                      Female
                    </Button>
                  </div>
                </div>

                {underageMessage && (
                  <div className="text-sm text-destructive">{underageMessage}</div>
                )}

                <Button onClick={handleProfileContinue} className="w-full" disabled={isLoading || !dob || !gender}>
                  Continue
                </Button>
              </div>
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
                  {/* Hidden inputs for file picking and camera capture */}
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Keep existing UI/logic intact; simply acknowledge selection
                        console.log("Selected ID file:", file.name)
                      }
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*;capture=camera"
                    // capture hints camera usage on supported mobile browsers
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        console.log("Captured/Chosen photo:", file.name)
                      }
                    }}
                  />

                  <Button onClick={handleUploadId} variant="outline" className="h-auto p-4 flex flex-col space-y-2 bg-transparent">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Upload ID</span>
                  </Button>
                  <Button onClick={handleTakePhoto} variant="outline" className="h-auto p-4 flex flex-col space-y-2 bg-transparent">
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">Take Photo</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleComplete} className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Verify ID"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minimal camera overlay for desktop getUserMedia capture */}
      {showCameraOverlay && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-background rounded-lg shadow-lg p-4 space-y-4">
            <div className="aspect-video bg-black rounded overflow-hidden">
              <video ref={videoRef} playsInline className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Button variant="ghost" onClick={stopCamera}>Cancel</Button>
              <Button onClick={handleCaptureFrame}>Capture</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
