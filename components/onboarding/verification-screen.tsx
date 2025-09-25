"use client"

import { useState } from "react"
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
              <span className="text-sm">Profile</span>
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
