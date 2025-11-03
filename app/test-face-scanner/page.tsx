"use client"

import { FaceScanner } from "@/components/FaceScanner"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Camera, CheckCircle, RotateCcw } from "lucide-react"

/**
 * Test page for Face Scanner Component
 * Use this page to test the face verification feature
 * Navigate to: http://localhost:3000/test-face-scanner
 */
export default function TestFaceScannerPage() {
  const [showScanner, setShowScanner] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [captureHistory, setCaptureHistory] = useState<string[]>([])

  const handleCapture = (imageUri: string) => {
    setCapturedImage(imageUri)
    setCaptureHistory(prev => [imageUri, ...prev])
    setShowScanner(false)
    
    console.log("📸 Image captured successfully!")
    console.log("Image size:", imageUri.length, "bytes")
  }

  const handleStartScan = () => {
    setShowScanner(true)
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setShowScanner(true)
  }

  const handleDownload = () => {
    if (!capturedImage) return
    
    // Create download link
    const link = document.createElement("a")
    link.href = capturedImage
    link.download = `face-verification-${Date.now()}.jpg`
    link.click()
  }

  if (showScanner) {
    return (
      <FaceScanner 
        onCapture={handleCapture}
        onClose={() => setShowScanner(false)}
        autoCaptureDuration={2000}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
            <Camera className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Face Scanner Test</h1>
          <p className="text-gray-400">
            Test the face verification component with real-time face detection
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {capturedImage ? (
            /* Result View */
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Capture Successful!</h2>
                  <p className="text-gray-400 text-sm">Face verification image captured</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Captured Image */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-green-500/30">
                    <Image 
                      src={capturedImage} 
                      alt="Captured face" 
                      width={400} 
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleRetake}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake Photo
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1"
                    >
                      Download
                    </Button>
                  </div>
                </div>

                {/* Image Info */}
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Image Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Format:</span>
                        <span className="font-mono">JPEG</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span className="font-mono">{(capturedImage.length / 1024).toFixed(2)} KB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Encoding:</span>
                        <span className="font-mono">Base64</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quality:</span>
                        <span className="font-mono">92%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Next Steps</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Upload to server for KYC verification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Compare with ID document photo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Store securely in encrypted storage</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Capture History */}
              {captureHistory.length > 1 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Previous Captures ({captureHistory.length - 1})
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {captureHistory.slice(1).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCapturedImage(img)}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors"
                      >
                        <Image 
                          src={img} 
                          alt={`Capture ${idx + 1}`} 
                          width={100} 
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Start View */
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                  <Camera className="w-10 h-10 text-blue-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Ready to Test?</h2>
                  <p className="text-gray-400">
                    Click the button below to start the face verification process
                  </p>
                </div>

                <Button
                  onClick={handleStartScan}
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Face Verification
                </Button>

                {/* Instructions */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 text-left">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Instructions</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">1.</span>
                      <span>Allow camera permission when prompted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">2.</span>
                      <span>Position your face inside the circular overlay</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">3.</span>
                      <span>Wait for the circle to turn green (face detected)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">4.</span>
                      <span>Hold still for 2 seconds for auto-capture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">5.</span>
                      <span>Or click "Capture Now" button manually</span>
                    </li>
                  </ul>
                </div>

                {/* System Requirements */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 text-left">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">System Requirements</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Modern Browser</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Camera Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>HTTPS (Prod)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Good Lighting</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with TensorFlow.js MediaPipe Face Detection</p>
          <p className="mt-1">Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  )
}

