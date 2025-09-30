"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, CheckCircle, Upload, Camera } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VerificationScreenProps {
  onComplete?: () => void
}

export function VerificationScreen({ onComplete }: VerificationScreenProps) {
  const [step, setStep] = useState<"profile" | "gender" | "id">("profile")
  const [verificationMethod, setVerificationMethod] = useState<"phone" | "email">("phone")
  const [contactValue, setContactValue] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [contactVerified, setContactVerified] = useState(true)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [gender, setGender] = useState<"male" | "female" | "prefer_not_to_say" | null>(null)
  const [dob, setDob] = useState("")
  const [profileValid, setProfileValid] = useState(false)
  const [underageMessage, setUnderageMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [showCameraOverlay, setShowCameraOverlay] = useState(false)
  const today = new Date()
  const defaultMonth = new Date(new Date().setFullYear(today.getFullYear() - 20))
  const [calendarMonth, setCalendarMonth] = useState<Date>(defaultMonth)

  // Live underage validation when DOB changes
  useEffect(() => {
    if (!dob) {
      setUnderageMessage(null)
      return
    }
    const age = calculateAge(dob)
    if (age < 17) {
      setUnderageMessage("You are not eligible to use Lovesathi according to age criteria (17+).")
    } else {
      setUnderageMessage(null)
    }
  }, [dob])

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

    if (verificationMethod === "phone") {
      setPhoneVerified(true)
      if (emailVerified) {
        setContactVerified(true)
        setStep("profile")
      } else {
        // Switch to email for second verification
        setVerificationMethod("email")
        setCodeSent(false)
        setVerificationCode("")
        setContactValue("")
      }
    } else {
      setEmailVerified(true)
      if (phoneVerified) {
        setContactVerified(true)
        setStep("profile")
      } else {
        // Switch to phone for second verification
        setVerificationMethod("phone")
        setCodeSent(false)
        setVerificationCode("")
        setContactValue("")
      }
    }
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
    if (age < 17) {
      setUnderageMessage("You're underage to use a dating app.")
      setProfileValid(false)
      return
    }
    if (dob) {
      setProfileValid(true)
      setStep("gender")
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    onComplete?.()
  }

  // Progress indicator helpers
  const currentStepIndex = step === "profile" ? 1 : step === "gender" ? 2 : 3
  const renderStep = (index: number, label: string) => {
    const state = currentStepIndex === index ? "active" : currentStepIndex > index ? "completed" : "inactive"
    const base = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
    const className =
      state === "completed"
        ? `bg-primary text-primary-foreground ${base}`
        : state === "active"
          ? `bg-black text-white ${base}`
          : `bg-muted text-muted-foreground ${base}`

    return (
      <div className="flex items-center space-x-2">
        <div className={className}>
          {state === "completed" ? <CheckCircle className="w-4 h-4" /> : index}
        </div>
        <span className="text-sm text-black">{label}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-black">Verify Your Account</CardTitle>
          <CardDescription className="text-black">Help us keep Lovesathi safe and authentic for everyone</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {renderStep(1, "DOB")}
            {renderStep(2, "Details")}
            {renderStep(3, "ID")}
          </div>

          {/* Contact step removed – start at DOB */}

          {/* Profile step (DOB + Gender) */}
          {step === "profile" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-black">When were you born?</h3>
                <p className="text-sm text-black">Select your date of birth. Minimum age is 17.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-black">Date of Birth</Label>
                  <div className="rounded-2xl border bg-background p-3 max-w-sm mx-auto space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Select
                        value={calendarMonth.getMonth().toString()}
                        onValueChange={(val) => {
                          const next = new Date(calendarMonth)
                          next.setMonth(parseInt(val))
                          setCalendarMonth(next)
                        }}
                      >
                        <SelectTrigger className="h-9 min-w-[110px] text-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-56 overflow-y-auto text-black bg-background border shadow-md">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <SelectItem key={i} value={i.toString()} className="text-black">
                              {new Date(2000, i, 1).toLocaleString("default", { month: "short" })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={calendarMonth.getFullYear().toString()}
                        onValueChange={(val) => {
                          const next = new Date(calendarMonth)
                          next.setFullYear(parseInt(val))
                          setCalendarMonth(next)
                        }}
                      >
                        <SelectTrigger className="h-9 min-w-[110px] text-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-56 overflow-y-auto text-black bg-background border shadow-md">
                          {Array.from({ length: today.getFullYear() - 1950 + 1 }).map((_, idx) => {
                            const y = 1950 + idx
                            return (
                              <SelectItem key={y} value={y.toString()} className="text-black">{y}</SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <Calendar
                      mode="single"
                      captionLayout="label"
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      selected={dob ? new Date(dob) : undefined}
                      onSelect={(date) => setDob(date ? new Date(date.getTime() - date.getTimezoneOffset()*60000).toISOString().slice(0,10) : "")}
                      fromYear={1950}
                      toYear={today.getFullYear()}
                      defaultMonth={dob ? new Date(dob) : defaultMonth}
                      disabled={(day) => {
                        const max = new Date()
                        max.setFullYear(max.getFullYear() - 17)
                        max.setHours(0,0,0,0)
                        const min = new Date(1950, 0, 1)
                        return day > max || day < min
                      }}
                      className="w-full text-black [--cell-size:2.5rem]"
                      classNames={{
                        weekdays: "grid grid-cols-7 gap-1",
                        week: "grid grid-cols-7 gap-1 w-full mt-2",
                        weekday: "text-black text-[0.8rem] text-center",
                        caption_label: "text-black hidden",
                        week_number: "text-black",
                      }}
                    />
                  </div>
                </div>
                <div className="text-center text-sm text-black">
                  {dob ? `Age: ${calculateAge(dob)}` : "Age: --"}
                </div>

                {underageMessage && (
                  <div className="text-sm text-destructive text-center">{underageMessage}</div>
                )}

                <Button onClick={handleProfileContinue} className="w-full" disabled={isLoading || !dob}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Details step: user's gender only */}
          {step === "gender" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-black">Who are you?</h3>
                <p className="text-sm text-black">Select your gender.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full rounded-md px-4 py-2 text-sm border ${
                    gender === "male"
                      ? "!bg-black !text-white !border-black hover:!bg-black"
                      : "bg-white text-black border-black hover:!bg-black hover:!text-white"
                  }`}
                  onClick={() => setGender("male")}
                >
                  Male
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full rounded-md px-4 py-2 text-sm border ${
                    gender === "female"
                      ? "!bg-black !text-white !border-black hover:!bg-black"
                      : "bg-white text-black border-black hover:!bg-black hover:!text-white"
                  }`}
                  onClick={() => setGender("female")}
                >
                  Female
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full rounded-md px-4 py-2 text-sm border ${
                    gender === "prefer_not_to_say"
                      ? "!bg-black !text-white !border-black hover:!bg-black"
                      : "bg-white text-black border-black hover:!bg-black hover:!text-white"
                  }`}
                  onClick={() => setGender("prefer_not_to_say")}
                >
                  Prefer not to say
                </Button>
              </div>
              <Button className="w-full" onClick={() => setStep("id")} disabled={gender === null}>
                Continue
              </Button>
            </div>
          )}

          {/* ID Verification */}
          {step === "id" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-black">ID Verification</h3>
                <p className="text-sm text-muted-foreground">Optional but recommended for enhanced trust</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-black">Why verify your ID?</p>
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

                  <Button onClick={handleUploadId} variant="outline" className="h-auto p-4 flex flex-col space-y-2 bg-transparent text-black">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Upload ID</span>
                  </Button>
                  <Button onClick={handleTakePhoto} variant="outline" className="h-auto p-4 flex flex-col space-y-2 bg-transparent text-black">
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
