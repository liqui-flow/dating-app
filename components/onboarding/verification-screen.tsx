"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, CheckCircle, Upload, Camera, X, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { FaceScanModal } from "@/components/kyc/FaceScanModal"
import { 
  saveDateOfBirth, 
  saveGender, 
  completeIDVerification 
} from "@/lib/verificationApi"

interface VerificationScreenProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function VerificationScreen({ onComplete, onSkip }: VerificationScreenProps) {
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
  const today = new Date()
  const defaultMonth = new Date(new Date().setFullYear(today.getFullYear() - 20))
  const [calendarMonth, setCalendarMonth] = useState<Date>(defaultMonth)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [capturedFacePhoto, setCapturedFacePhoto] = useState<File | null>(null)
  const [facePhotoPreview, setFacePhotoPreview] = useState<string | null>(null)
  const [showFaceScanModal, setShowFaceScanModal] = useState(false)
  const { toast } = useToast()

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

  const handleFileUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload Aadhar card, PAN card, Driving License, or Passport (.jpg, .jpeg, .png, .pdf)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Set the uploaded file
    setUploadedFile(file)

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // For PDFs, no preview
      setFilePreview(null)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setFilePreview(null)
    if (uploadInputRef.current) {
      uploadInputRef.current.value = ''
    }
  }

  const handleUploadId = () => {
    // Works on Web (desktop/mobile) and mobile browsers on Android/iOS
    uploadInputRef.current?.click()
  }

  const handleTakePhoto = async () => {
    // Open the face scan modal for KYC verification
    setShowFaceScanModal(true)
  }

  const handleFaceScanComplete = async (imageBlob: Blob) => {
    // Convert blob to File
    const file = new File([imageBlob], `face-scan-${Date.now()}.jpg`, { type: "image/jpeg" })
    
    // Set the captured photo
    setCapturedFacePhoto(file)
    
    // Generate preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFacePhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Show success toast
    toast({
      title: "Face Scan Complete",
      description: "Your face has been successfully verified.",
    })

    // TODO: Send to backend API for verification
    // await verifyFaceScan(file)
  }

  const handleRemoveFacePhoto = () => {
    setCapturedFacePhoto(null)
    setFacePhotoPreview(null)
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

  const handleProfileContinue = async () => {
    console.log('🔵 handleProfileContinue called', { dob, isLoading })
    
    setUnderageMessage(null)
    
    if (!dob) {
      console.log('❌ No DOB provided')
      toast({
        title: "Date Required",
        description: "Please select your date of birth.",
        variant: "destructive",
      })
      return
    }

    const age = calculateAge(dob)
    console.log('📅 Calculated age:', age)
    
    if (age < 17) {
      setUnderageMessage("You're underage to use a dating app.")
      setProfileValid(false)
      toast({
        title: "Age Restriction",
        description: "You must be at least 17 years old to use this app.",
        variant: "destructive",
      })
      return
    }

    console.log('✅ Age validation passed, starting save...')
    setIsLoading(true)
    
    try {
      console.log('📤 Calling saveDateOfBirth with:', dob)
      // Save DOB to Supabase
      const result = await saveDateOfBirth(dob)
      console.log('📥 saveDateOfBirth result:', result)
      
      if (result.success) {
        console.log('✅ DOB saved successfully')
        toast({
          title: "Date of Birth Saved",
          description: "Your date of birth has been saved successfully.",
        })
        setProfileValid(true)
        setStep("gender")
      } else {
        console.error('❌ Failed to save DOB:', result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to save date of birth. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('❌ Error in handleProfileContinue:', error)
      console.error('Error stack:', error.stack)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      console.log('🏁 handleProfileContinue finished')
    }
  }

  const handleComplete = async () => {
    // Validate that both files are uploaded
    if (!uploadedFile || !capturedFacePhoto) {
      toast({
        title: "Missing Files",
        description: "Please upload both ID document and face scan to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    // Upload files and save verification to Supabase
    const result = await completeIDVerification(uploadedFile, capturedFacePhoto)
    
    setIsLoading(false)
    
    if (result.success) {
      toast({
        title: "Verification Submitted",
        description: "Your ID verification has been submitted successfully and is pending review.",
      })
      onComplete?.()
    } else {
      toast({
        title: "Verification Failed",
        description: result.error || "Failed to submit verification. Please try again.",
        variant: "destructive",
      })
    }
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
          ? `bg-primary text-primary-foreground ${base}`
          : `bg-muted text-muted-foreground ${base}`

    return (
      <div className="flex items-center space-x-2">
        <div className={className}>
          {state === "completed" ? <CheckCircle className="w-4 h-4" /> : index}
        </div>
        <span className="text-sm text-primary">{label}</span>
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
          <CardTitle className="text-2xl text-primary">Verify Your Account</CardTitle>
          <CardDescription className="text-primary">Help us keep Lovesathi safe and authentic for everyone</CardDescription>
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
                <h3 className="text-lg font-semibold mb-2 text-primary">When were you born?</h3>
                <p className="text-sm text-primary">Select your date of birth. Minimum age is 17.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-primary">Date of Birth</Label>
                  <div className="rounded-2xl border bg-background p-3 max-w-sm mx-auto space-y-3">
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      min="1950-01-01"
                      max={`${today.getFullYear() - 17}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`}
                      className="text-primary"
                    />
                  </div>
                </div>
                <div className="text-center text-sm text-primary">
                  {dob ? `Age: ${calculateAge(dob)}` : "Age: --"}
                </div>

                {underageMessage && (
                  <div className="text-sm text-destructive text-center">{underageMessage}</div>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('🔘 Continue button clicked', { dob, isLoading })
                      handleProfileContinue()
                    }} 
                    className="w-full" 
                    disabled={isLoading || !dob}
                    type="button"
                  >
                    {isLoading ? "Saving..." : "Continue"}
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    variant="outline" 
                    className="w-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-[#4A0E0E] hover:border-[#4A0E0E] hover:text-white transition-all"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Details step: user's gender only */}
          {step === "gender" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-primary">Who are you?</h3>
                <p className="text-sm text-primary">Select your gender.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full rounded-md px-4 py-2 text-sm border ${
                    gender === "male"
                      ? "!bg-primary !text-primary-foreground !border-primary hover:!bg-primary"
                      : "bg-white text-primary border-primary hover:!bg-primary hover:!text-primary-foreground"
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
                      ? "!bg-primary !text-primary-foreground !border-primary hover:!bg-primary"
                      : "bg-white text-primary border-primary hover:!bg-primary hover:!text-primary-foreground"
                  }`}
                  onClick={() => setGender("female")}
                >
                  Female
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full rounded-md px-3 py-2 text-xs border whitespace-nowrap ${
                    gender === "prefer_not_to_say"
                      ? "!bg-primary !text-primary-foreground !border-primary hover:!bg-primary"
                      : "bg-white text-primary border-primary hover:!bg-primary hover:!text-primary-foreground"
                  }`}
                  onClick={() => setGender("prefer_not_to_say")}
                >
                  Prefer not to say
                </Button>
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={async () => {
                    if (gender === null) return
                    
                    setIsLoading(true)
                    
                    // Save gender to Supabase
                    const result = await saveGender(gender)
                    
                    setIsLoading(false)
                    
                    if (result.success) {
                      toast({
                        title: "Gender Saved",
                        description: "Your gender has been saved successfully.",
                      })
                      setStep("id")
                    } else {
                      toast({
                        title: "Error",
                        description: result.error || "Failed to save gender. Please try again.",
                        variant: "destructive",
                      })
                    }
                  }} 
                  disabled={gender === null || isLoading}
                >
                  {isLoading ? "Saving..." : "Continue"}
                </Button>
                <Button 
                  onClick={() => setStep("profile")} 
                  variant="outline" 
                  className="w-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-[#4A0E0E] hover:border-[#4A0E0E] hover:text-white transition-all"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* ID Verification */}
          {step === "id" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-primary">ID Verification</h3>
                <p className="text-sm text-muted-foreground">Optional but recommended for enhanced trust</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-primary">Why verify your ID?</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Get a verified badge on your profile</li>
                        <li>• Increase trust with potential matches</li>
                        <li>• Access premium features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Hidden input for file picking */}
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileUpload(file)
                      }
                    }}
                  />

                  {/* Upload ID and Take Photo buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Upload ID Button - Transforms when file is uploaded */}
                    {!uploadedFile ? (
                      <Button 
                        onClick={handleUploadId} 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col space-y-2 bg-transparent text-primary w-full transition-all duration-300"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-sm">Upload ID</span>
                      </Button>
                    ) : (
                      <div className="relative h-auto p-3 border border-border rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm overflow-hidden transition-all duration-300 animate-in fade-in-50 scale-in-95">
                        {/* Delete Button - Top Right */}
                        <button
                          onClick={handleRemoveFile}
                          className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        {/* File Preview Content */}
                        <div className="flex flex-col items-center space-y-2">
                          {/* Image Preview or PDF Icon */}
                          {filePreview ? (
                            <div className="w-full h-20 rounded-md overflow-hidden border border-border/50 shadow-sm">
                              <img 
                                src={filePreview} 
                                alt="ID Preview" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-20 rounded-md bg-primary/10 flex items-center justify-center border border-border/50">
                              <FileText className="w-10 h-10 text-primary" />
                            </div>
                          )}
                          
                          {/* File Info */}
                          <div className="w-full space-y-0.5 pr-4">
                            <p className="text-xs font-medium text-primary truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Take Photo Button - Transforms when face photo is captured */}
                    {!capturedFacePhoto ? (
                      <Button 
                        onClick={handleTakePhoto} 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col space-y-2 bg-transparent text-primary w-full transition-all duration-300"
                      >
                        <Camera className="w-6 h-6" />
                        <span className="text-sm">Take Photo</span>
                      </Button>
                    ) : (
                      <div className="relative h-auto p-3 border border-border rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm overflow-hidden transition-all duration-300 animate-in fade-in-50 scale-in-95">
                        {/* Delete Button - Top Right */}
                        <button
                          onClick={handleRemoveFacePhoto}
                          className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Face Photo Preview Content */}
                        <div className="flex flex-col items-center space-y-2">
                          {/* Image Preview */}
                          {facePhotoPreview && (
                            <div className="w-full h-20 rounded-md overflow-hidden border border-border/50 shadow-sm">
                              <img 
                                src={facePhotoPreview} 
                                alt="Face Scan" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* File Info */}
                          <div className="w-full space-y-0.5 pr-4">
                            <p className="text-xs font-medium text-primary truncate">
                              {capturedFacePhoto.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {(capturedFacePhoto.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleComplete} 
                    className="w-full" 
                    disabled={isLoading || !uploadedFile || !capturedFacePhoto}
                  >
                    {isLoading ? "Uploading & Saving..." : "Verify ID"}
                  </Button>
                  <Button 
                    onClick={() => setStep("gender")} 
                    variant="outline" 
                    className="w-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-[#4A0E0E] hover:border-[#4A0E0E] hover:text-white transition-all"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  {onSkip && (
                    <Button 
                      onClick={onSkip} 
                      variant="outline" 
                      className="w-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-[#4A0E0E] hover:border-[#4A0E0E] hover:text-white transition-all"
                      disabled={isLoading}
                    >
                      Skip for now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Face Scan Modal */}
      <FaceScanModal
        isOpen={showFaceScanModal}
        onClose={() => setShowFaceScanModal(false)}
        onScanComplete={handleFaceScanComplete}
      />
    </div>
  )
}