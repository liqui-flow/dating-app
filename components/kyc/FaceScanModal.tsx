"use client"

import { useEffect } from "react"
import { X, Camera, CheckCircle, AlertCircle } from "lucide-react"
import { useFaceScan } from "@/hooks/useFaceScan"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FaceScanModalProps {
  isOpen: boolean
  onClose: () => void
  onScanComplete: (imageBlob: Blob) => void
}

export function FaceScanModal({ isOpen, onClose, onScanComplete }: FaceScanModalProps) {
  const {
    status,
    faceStatus,
    headPosition,
    progress,
    isModelsLoaded,
    errorMessage,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    resetScan,
    captureFaceImage,
  } = useFaceScan({
    onScanComplete: (blob) => {
      onScanComplete(blob)
      onClose()
    },
    onError: (error) => {
      console.error("Face scan error:", error)
    },
  })

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && isModelsLoaded) {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, isModelsLoaded, startCamera, stopCamera])

  if (!isOpen) return null

  // Determine circle border color based on face detection status
  const getCircleBorderColor = () => {
    if (status === "complete") return "border-green-500 shadow-green-500/50"
    if (faceStatus === "none") return "border-red-500 shadow-red-500/50"
    if (faceStatus === "detected") return "border-green-500 shadow-green-500/50"
    return "border-white/30 shadow-white/20"
  }

  // Get instruction text based on current state
  const getInstructionText = () => {
    if (status === "loading") return "Initializing camera..."
    if (status === "error") return errorMessage || "Camera error"
    if (status === "complete") return "Scan complete! ✓"
    if (faceStatus === "none") return "Position your face in the circle"
    if (progress < 20) return "Look straight ahead"
    if (progress < 50) return "Slowly turn your head to the left"
    if (progress < 75) return "Return to center"
    if (progress < 100) return "Now turn your head to the right"
    return "Almost done! Return to center"
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-md">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Face Verification</h3>
              <p className="text-white/70 text-xs">KYC Identity Check</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Camera Feed */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Circular Mask Overlay */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {/* Dark overlay with circular cutout effect */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" style={{
              WebkitMaskImage: "radial-gradient(circle at center, transparent 35%, black 36%)",
              maskImage: "radial-gradient(circle at center, transparent 35%, black 36%)",
            }} />

            {/* Circular border frame */}
            <div 
              className={`relative w-[70vw] h-[70vw] max-w-[400px] max-h-[400px] rounded-full border-4 transition-all duration-300 shadow-2xl ${getCircleBorderColor()}`}
              style={{
                background: "transparent",
              }}
            >
              {/* Status indicators inside circle */}
              {faceStatus === "detected" && status !== "complete" && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
              
              {faceStatus === "none" && status === "scanning" && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Head position guide lines (optional visual aid) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Center line */}
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-white/30 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Position indicator dots */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${headPosition === "left" ? "bg-green-500 scale-150" : "bg-white/30"}`} />
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${headPosition === "center" ? "bg-green-500 scale-150" : "bg-white/30"}`} />
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${headPosition === "right" ? "bg-green-500 scale-150" : "bg-white/30"}`} />
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-md">
          {/* Instructions */}
          <div className="text-center mb-6 space-y-3">
            <p className="text-white text-base font-medium animate-in fade-in-50 duration-500">
              {getInstructionText()}
            </p>
            
            {/* Progress Bar */}
            {status === "scanning" && (
              <div className="max-w-md mx-auto space-y-2 animate-in fade-in-50 duration-500">
                <Progress value={progress} className="h-2 bg-white/20" />
                <p className="text-white/60 text-xs">
                  Scan Progress: {Math.round(progress)}%
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-3">
            {status === "error" && (
              <Button
                onClick={resetScan}
                className="px-8 py-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20"
              >
                Try Again
              </Button>
            )}

            {status === "complete" && (
              <Button
                onClick={() => captureFaceImage()}
                className="px-12 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl shadow-green-500/30 text-lg font-semibold"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Capture & Continue
              </Button>
            )}

            {status === "scanning" && progress >= 100 && (
              <Button
                onClick={() => captureFaceImage()}
                className="px-12 py-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-xl shadow-primary/30 text-lg font-semibold animate-in zoom-in-50 duration-300"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Capture & Continue
              </Button>
            )}

            {status === "scanning" && progress < 100 && (
              <Button
                disabled
                className="px-12 py-6 rounded-2xl bg-white/10 text-white/40 backdrop-blur-md border border-white/10 text-lg font-semibold cursor-not-allowed"
              >
                Complete Scan First
              </Button>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-md">
              <p className="text-red-200 text-sm text-center">{errorMessage}</p>
            </div>
          )}

          {/* Loading state */}
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin mx-auto" />
                <p className="text-white text-sm">Loading camera...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

