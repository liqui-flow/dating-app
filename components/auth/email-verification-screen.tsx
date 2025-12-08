"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { StaticBackground } from "@/components/discovery/static-background"
import { useToast } from "@/components/ui/use-toast"

interface EmailVerificationScreenProps {
  onVerified?: () => void
}

export function EmailVerificationScreen({ onVerified }: EmailVerificationScreenProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  // Check email verification status on mount and periodically
  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null
    let interval: NodeJS.Timeout | null = null

    const checkEmailVerification = async (retryCount = 0) => {
      try {
        // Wait for session to be established (with retries)
        const { data: { session } } = await supabase.auth.getSession()
        
        // If no session and we haven't retried too many times, wait and retry
        if (!session && retryCount < 3) {
          console.log(`No session yet, retrying... (${retryCount + 1}/3)`)
          setTimeout(() => {
            if (mounted) {
              checkEmailVerification(retryCount + 1)
            }
          }, 1000)
          return
        }

        // After retries, try getUser as fallback
        if (!session) {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            if (mounted) {
              setIsLoading(false)
              // Wait a bit before redirecting to give session time to establish
              setTimeout(() => {
                if (mounted) {
                  router.push("/auth")
                }
              }, 2000)
            }
            return
          }
          // User found via getUser, use it
          if (mounted) {
            setUserEmail(user.email || null)
            setIsLoading(false)
            if (user.email_confirmed_at) {
              setIsVerified(true)
              setTimeout(() => {
                if (mounted) {
                  if (onVerified) {
                    onVerified()
                  } else {
                    router.push("/onboarding/verification")
                  }
                }
              }, 1000)
            }
          }
          return
        }

        const user = session.user
        
        if (!user) {
          if (mounted) {
            setIsLoading(false)
            setTimeout(() => {
              if (mounted) {
                router.push("/auth")
              }
            }, 1000)
          }
          return
        }

        if (mounted) {
          setUserEmail(user.email || null)
          setIsLoading(false)
          
          // Check if email is already verified
          if (user.email_confirmed_at) {
            setIsVerified(true)
            // Auto-proceed after a short delay
            setTimeout(() => {
              if (mounted) {
                if (onVerified) {
                  onVerified()
                } else {
                  router.push("/onboarding/verification")
                }
              }
            }, 1000)
            return
          }
        }

        // Set up auth state listener to detect when email is verified
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (mounted && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
            if (newSession?.user?.email_confirmed_at) {
              setIsVerified(true)
              if (onVerified) {
                onVerified()
              } else {
                router.push("/onboarding/verification")
              }
            }
          }
        })
        subscription = authSubscription
      } catch (error) {
        console.error("Error checking email verification:", error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    checkEmailVerification()

    // Poll for email verification every 3 seconds
    interval = setInterval(async () => {
      if (mounted && !isVerified) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email_confirmed_at) {
          setIsVerified(true)
          if (onVerified) {
            onVerified()
          } else {
            router.push("/onboarding/verification")
          }
        }
      }
    }, 3000)

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [router, onVerified, isVerified])

  const handleResendEmail = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "No email address found. Please try signing in again.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      })

      if (error) throw error

      toast({
        title: "Email sent!",
        description: "Verification email has been sent. Please check your inbox.",
      })
    } catch (error: any) {
      console.error("Error resending email:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleContinue = async () => {
    setIsChecking(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth")
        return
      }

      // Check if email is verified
      if (!user.email_confirmed_at) {
        toast({
          title: "Email not verified",
          description: "Please verify your email before continuing. Check your inbox for the verification link.",
          variant: "destructive",
        })
        setIsChecking(false)
        return
      }

      // Email is verified, proceed
      setIsVerified(true)
      if (onVerified) {
        onVerified()
      } else {
        router.push("/onboarding/verification")
      }
    } catch (error: any) {
      console.error("Error checking verification:", error)
      toast({
        title: "Error",
        description: "Failed to verify email status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  // Show loading state while checking for user
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative">
        <StaticBackground />
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-6 pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <p className="text-white text-sm">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative">
      <StaticBackground />
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 pt-6 sm:pt-6">
          <div className="flex justify-center mb-4">
            {isVerified ? (
              <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            ) : (
              <div className="rounded-full bg-blue-500/20 p-4">
                <Mail className="w-12 h-12 text-blue-500" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-white">
            {isVerified ? "Email Verified!" : "Verify Your Email"}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-300">
            {isVerified 
              ? "Your email has been verified. Redirecting..." 
              : userEmail 
                ? `We've sent a verification email to ${userEmail}. Please check your inbox and click the verification link.`
                : "We've sent a verification email. Please check your inbox and click the verification link."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-6 space-y-4">
          {!isVerified && (
            <>
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full h-11 font-medium bg-white/10 text-white border-white/20 hover:bg-white/20"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleContinue}
                  className="w-full h-11 font-medium"
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400 pt-2">
                <p>Didn't receive the email? Check your spam folder or click "Resend Email" above.</p>
              </div>
            </>
          )}

          {isVerified && (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-green-500" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

