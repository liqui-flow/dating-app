"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as faceapi from "face-api.js"

export type ScanStatus = "idle" | "loading" | "scanning" | "complete" | "error"
export type FaceStatus = "none" | "detected" | "invalid"
export type HeadPosition = "center" | "left" | "right"

interface UseFaceScanOptions {
  onScanComplete?: (imageBlob: Blob) => void
  onError?: (error: string) => void
}

export function useFaceScan({ onScanComplete, onError }: UseFaceScanOptions = {}) {
  const [status, setStatus] = useState<ScanStatus>("idle")
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("none")
  const [headPosition, setHeadPosition] = useState<HeadPosition>("center")
  const [progress, setProgress] = useState(0)
  const [isModelsLoaded, setIsModelsLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // Track scan progress: center -> left -> center -> right -> center
  const scanSequence = useRef<HeadPosition[]>([])
  const requiredSequence: HeadPosition[] = ["center", "left", "center", "right", "center"]

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models" // Models need to be in public/models folder
        
        // Try loading from CDN if local models not available
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"),
          faceapi.nets.faceLandmark68Net.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"),
          faceapi.nets.faceExpressionNet.loadFromUri("https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"),
        ])
        
        setIsModelsLoaded(true)
      } catch (error) {
        console.error("Error loading face-api models:", error)
        setErrorMessage("Failed to load face detection models")
        onError?.("Failed to load face detection models")
      }
    }

    loadModels()
  }, [onError])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setStatus("loading")
      setErrorMessage(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setStatus("scanning")
    } catch (error: any) {
      console.error("Error accessing camera:", error)
      const message = error.name === "NotAllowedError" 
        ? "Camera permission denied. Please allow camera access to continue."
        : "Failed to access camera. Please check your device settings."
      
      setErrorMessage(message)
      setStatus("error")
      onError?.(message)
    }
  }, [onError])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    setStatus("idle")
  }, [])

  // Detect face and head rotation
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !isModelsLoaded || status !== "scanning") return

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

      if (!detection) {
        setFaceStatus("none")
        return
      }

      setFaceStatus("detected")

      // Get face landmarks to determine head rotation
      const landmarks = detection.landmarks
      const positions = landmarks.positions

      // Calculate head rotation based on nose and face outline
      // Using landmarks: nose tip (30), left face outline (0), right face outline (16)
      const noseTip = positions[30]
      const leftFace = positions[0]
      const rightFace = positions[16]

      const faceWidth = rightFace.x - leftFace.x
      const noseOffsetFromCenter = noseTip.x - (leftFace.x + faceWidth / 2)
      const rotationRatio = noseOffsetFromCenter / (faceWidth / 2)

      // Determine head position based on rotation
      let currentPosition: HeadPosition = "center"
      
      if (rotationRatio < -0.15) {
        currentPosition = "left" // Head turned to user's left (nose pointing left)
      } else if (rotationRatio > 0.15) {
        currentPosition = "right" // Head turned to user's right (nose pointing right)
      } else {
        currentPosition = "center"
      }

      setHeadPosition(currentPosition)

      // Update scan sequence
      const lastPosition = scanSequence.current[scanSequence.current.length - 1]
      if (currentPosition !== lastPosition) {
        scanSequence.current.push(currentPosition)
        
        // Check if sequence matches required pattern
        const currentSequence = scanSequence.current.slice(-5)
        const matchedSteps = currentSequence.filter((pos, idx) => {
          return idx < requiredSequence.length && pos === requiredSequence[idx]
        }).length

        const newProgress = Math.min((matchedSteps / requiredSequence.length) * 100, 100)
        setProgress(newProgress)

        // Check if scan is complete
        if (
          currentSequence.length >= requiredSequence.length &&
          currentSequence.slice(-5).every((pos, idx) => pos === requiredSequence[idx])
        ) {
          setStatus("complete")
          await captureFaceImage()
        }
      }
    } catch (error) {
      console.error("Error detecting face:", error)
    }
  }, [isModelsLoaded, status])

  // Capture face image
  const captureFaceImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (blob) {
        onScanComplete?.(blob)
      }
      stopCamera()
    }, "image/jpeg", 0.95)
  }, [onScanComplete, stopCamera])

  // Start face detection loop
  useEffect(() => {
    if (status === "scanning" && isModelsLoaded) {
      detectionIntervalRef.current = setInterval(detectFace, 200) // Detect every 200ms

      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current)
        }
      }
    }
  }, [status, isModelsLoaded, detectFace])

  // Reset scan
  const resetScan = useCallback(() => {
    scanSequence.current = []
    setProgress(0)
    setStatus("scanning")
    setFaceStatus("none")
    setHeadPosition("center")
  }, [])

  return {
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
  }
}

