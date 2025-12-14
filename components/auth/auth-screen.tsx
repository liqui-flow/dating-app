"use client"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GoogleLoginButton from "@/components/auth/GoogleLoginButton"
import AppleLoginButton from "@/components/auth/AppleLoginButton"
import { Eye, EyeOff, ArrowLeft, Heart } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface AuthScreenProps {
  onAuthSuccess?: () => void
}

type AuthView = "landing" | "login" | "signup"

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const router = useRouter()
  const [view, setView] = useState<AuthView>("landing")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)

  // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  // 🔹 Handle Sign Up
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/onboarding/verification`,
        },
      })
      if (error) throw error

      // Redirect to email verification page
      router.push("/auth/verify-email")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Handle Post-Login Redirect Logic
  const handlePostLogin = async (userId: string) => {
    try {
      // First check if email is verified
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !user.email_confirmed_at) {
        console.log('Email not verified, sending to email verification')
        router.push('/auth/verify-email')
        return
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('selected_path, onboarding_completed')
        .eq('user_id', userId)
        .single()

      if (error || !profile) {
        console.log('No profile found, sending to onboarding')
        router.push('/onboarding/verification')
        return
      }

      // Check if onboarding is explicitly completed (true)
      if (profile.onboarding_completed !== true) {
        console.log('Onboarding not completed, sending to verification:', { 
          onboarding_completed: profile.onboarding_completed 
        })
        router.push('/onboarding/verification')
        return
      }

      // If onboarding is completed, show path selection instead of going directly to dashboard
      router.push('/select-path')
      return
    } catch (err) {
      console.error('Error checking profile:', err)
      router.push('/onboarding/verification')
    }
  }

  // 🔹 Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (error) throw error

      if (data.user) {
        await handlePostLogin(data.user.id)
      } else {
        router.push("/onboarding/verification")
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setIsLoading(false)
    }
  }

  // ========== LANDING PAGE ==========
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-[#97011A]/5 pointer-events-none" />
        
        {/* Content */}
        <div className="relative flex-1 flex flex-col items-center justify-between px-6 py-12 sm:py-16">
          {/* Top section - Brand */}
          <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#97011A] rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" />
            </div>
            <h1 
              className="text-5xl sm:text-6xl font-bold text-black"
              style={{ fontFamily: 'var(--font-script)' }}
            >
              Lovesathi
            </h1>
            <p className="text-lg sm:text-xl text-black/75 font-medium max-w-sm">
              Where meaningful connections begin
            </p>
          </div>

          {/* Bottom section - CTAs */}
          <div className="w-full max-w-md space-y-3">
            <GoogleLoginButton />
            <AppleLoginButton />
            
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setView("signup")}
            >
              Continue with Email
            </Button>

            <div className="flex items-center justify-center gap-2 pt-4">
              <p className="text-sm text-black/70">Already have an account?</p>
              <Button
                variant="link"
                className="text-sm p-0 h-auto font-semibold"
                onClick={() => setView("login")}
              >
                Log In
              </Button>
            </div>

            {/* Terms & Privacy */}
            <p className="text-xs text-center text-black/60 pt-4 leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="#" className="text-[#97011A] hover:underline font-semibold">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#97011A] hover:underline font-semibold">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ========== LOGIN PAGE ==========
  if (view === "login") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => {
              setView("landing")
              setError(null)
              setFormData({ name: "", email: "", phone: "", password: "" })
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold text-black">Log In</h2>
          <div className="w-9" /> {/* Spacer for center alignment */}
        </div>

        {/* Form */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-black">Welcome back</h1>
              <p className="text-base text-black/70">
                Sign in to continue your journey
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-black/70"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  asChild 
                  variant="link" 
                  className="px-0 text-sm h-auto"
                >
                  <a href="/auth/forgot-password">Forgot password?</a>
                </Button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[#97011A]/10 border border-[#97011A]/20">
                  <p className="text-[#97011A] text-sm text-center font-semibold">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full font-semibold" 
                size="lg" 
                disabled={isLoading}
              >
                {isLoading ? "Logging In..." : "Log In"}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-black/60 font-semibold tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <GoogleLoginButton variant="login" />
              <AppleLoginButton variant="login" />
            </div>

            <div className="text-center pt-6">
              <p className="text-sm text-black/70">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm font-semibold"
                  onClick={() => {
                    setView("signup")
                    setError(null)
                  }}
                >
                  Sign Up
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== SIGNUP PAGE ==========
  if (view === "signup") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => {
              setView("landing")
              setError(null)
              setFormData({ name: "", email: "", phone: "", password: "" })
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold text-black">Sign Up</h2>
          <div className="w-9" /> {/* Spacer for center alignment */}
        </div>

        {/* Form */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-black">Create Account</h1>
              <p className="text-base text-black/70">
                Join thousands finding meaningful connections
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input 
                  id="signup-name" 
                  placeholder="Enter your full name" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number (Optional)</Label>
                <Input 
                  id="signup-phone" 
                  type="tel" 
                  placeholder="Enter your phone number" 
                  value={formData.phone} 
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-black/70"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[#97011A]/10 border border-[#97011A]/20">
                  <p className="text-[#97011A] text-sm text-center font-semibold">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full font-semibold" 
                size="lg" 
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-black/60 font-semibold tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <GoogleLoginButton />
              <AppleLoginButton />
            </div>

            <div className="text-center pt-6">
              <p className="text-sm text-black/70">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm font-semibold"
                  onClick={() => {
                    setView("login")
                    setError(null)
                  }}
                >
                  Log In
                </Button>
              </p>
            </div>

            <p className="text-xs text-center text-black/60 pt-4 leading-relaxed">
              By signing up, you agree to our{" "}
              <a href="#" className="text-[#97011A] hover:underline font-semibold">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#97011A] hover:underline font-semibold">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
