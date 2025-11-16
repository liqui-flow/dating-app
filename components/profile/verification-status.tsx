"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Upload, Camera, X, FileText, AlertCircle, CheckCircle, Shield } from "lucide-react"
import { BackFloatingButton } from "@/components/navigation/back-floating-button"
import { StaticBackground } from "@/components/discovery/static-background"
import { FaceScanModal } from "@/components/kyc/FaceScanModal"
import { useToast } from "@/components/ui/use-toast"
import { 
  getIDVerification, 
  completeIDVerification 
} from "@/lib/verificationApi"

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'in_review' | null

export function VerificationStatus({ onBack }: { onBack?: () => void }) {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [capturedFacePhoto, setCapturedFacePhoto] = useState<File | null>(null)
  const [facePhotoPreview, setFacePhotoPreview] = useState<string | null>(null)
  const [showFaceScanModal, setShowFaceScanModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  // Check verification status on mount
  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = async () => {
    setCheckingStatus(true)
    try {
      const result = await getIDVerification()
      if (result.success && result.data) {
        setVerificationStatus(result.data.verification_status as VerificationStatus)
      } else {
        setVerificationStatus(null)
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
      setVerificationStatus(null)
    } finally {
      setCheckingStatus(false)
    }
  }

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
    uploadInputRef.current?.click()
  }

  const handleTakePhoto = async () => {
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

    toast({
      title: "Face Scan Complete",
      description: "Your face has been successfully captured.",
    })
  }

  const handleRemoveFacePhoto = () => {
    setCapturedFacePhoto(null)
    setFacePhotoPreview(null)
  }

  const handleSubmit = async () => {
    // Validate that both files are uploaded
    if (!uploadedFile || !capturedFacePhoto) {
      toast({
        title: "Missing Files",
        description: "Please upload both ID document and face scan to continue.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    // Upload files and save verification to Supabase
    const result = await completeIDVerification(uploadedFile, capturedFacePhoto)
    
    setLoading(false)
    
    if (result.success) {
      toast({
        title: "Verification Submitted",
        description: "Your ID verification has been submitted successfully and is pending review.",
      })
      // Refresh status
      await checkVerificationStatus()
      // Clear files
      setUploadedFile(null)
      setCapturedFacePhoto(null)
      setFilePreview(null)
      setFacePhotoPreview(null)
    } else {
      toast({
        title: "Verification Failed",
        description: result.error || "Failed to submit verification. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isVerified = verificationStatus === 'approved'
  const isPending = verificationStatus === 'pending' || verificationStatus === 'in_review'
  const isRejected = verificationStatus === 'rejected'
  const needsVerification = !verificationStatus || isRejected

  return (
    <div className="flex flex-col h-full relative">
      <StaticBackground />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile Verification</h1>
          {isPending && (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <span className="text-sm font-semibold">Verification Pending</span>
            </div>
          )}
        </div>

        {checkingStatus ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Checking verification status...</p>
            </CardContent>
          </Card>
        ) : isVerified ? (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <CardTitle>You're Verified</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Government ID and selfie have been verified.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                {isPending && <AlertCircle className="w-6 h-6 text-destructive" />}
                <CardTitle>Verification {isPending ? 'Pending' : isRejected ? 'Rejected' : 'Required'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPending && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Verification Pending</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your verification is currently under review. You can update your documents if needed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {isRejected && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">
                    Your verification was rejected. Please upload new documents to try again.
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Upload a government ID and a selfie to verify your profile.
              </p>
              <Separator />
              
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

              <div className="grid grid-cols-2 gap-4">
                {/* Upload ID Button */}
                {!uploadedFile ? (
                  <Button 
                    onClick={handleUploadId} 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col space-y-2"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Upload ID</span>
                  </Button>
                ) : (
                  <div className="relative p-3 border border-border rounded-lg bg-muted/50">
                    <button
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex flex-col items-center space-y-2">
                      {filePreview ? (
                        <div className="w-full h-20 rounded-md overflow-hidden border border-border/50">
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
                      <div className="w-full space-y-0.5 pr-4">
                        <p className="text-xs font-medium truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Face Scanner Button */}
                {!capturedFacePhoto ? (
                  <Button 
                    onClick={handleTakePhoto} 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col space-y-2"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">Face Scanner</span>
                  </Button>
                ) : (
                  <div className="relative p-3 border border-border rounded-lg bg-muted/50">
                    <button
                      onClick={handleRemoveFacePhoto}
                      className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex flex-col items-center space-y-2">
                      {facePhotoPreview && (
                        <div className="w-full h-20 rounded-md overflow-hidden border border-border/50">
                          <img 
                            src={facePhotoPreview} 
                            alt="Face Scan" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="w-full space-y-0.5 pr-4">
                        <p className="text-xs font-medium truncate">
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

              <Button 
                onClick={handleSubmit} 
                disabled={!uploadedFile || !capturedFacePhoto || loading}
                className="w-full"
              >
                {loading ? "Uploading..." : "Submit for Verification"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <BackFloatingButton onClick={onBack} />
      
      {/* Face Scan Modal */}
      <FaceScanModal
        isOpen={showFaceScanModal}
        onClose={() => setShowFaceScanModal(false)}
        onScanComplete={handleFaceScanComplete}
      />
    </div>
  )
}