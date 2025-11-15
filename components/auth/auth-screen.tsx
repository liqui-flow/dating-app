"use client"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import GoogleLoginButton from "@/components/auth/GoogleLoginButton"
import AppleLoginButton from "@/components/auth/AppleLoginButton"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { StaticBackground } from "@/components/discovery/static-background"

interface AuthScreenProps {
  onAuthSuccess?: () => void
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signup")
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
      const { error } = await supabase.auth.signUp({
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

      router.push("/onboarding/verification")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Handle Post-Login Redirect Logic
  const handlePostLogin = async (userId: string) => {
    try {
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

      if (!profile.onboarding_completed) {
        router.push('/onboarding/verification')
        return
      }

      if (profile.selected_path === 'dating') {
        router.push('/dating/dashboard')
        return
      }

      if (profile.selected_path === 'matrimony') {
        router.push('/matrimony/discovery')
        return
      }

      // fallback
      router.push('/onboarding/verification')
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

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative">
      <StaticBackground />
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 pt-6 sm:pt-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white font-sans">Lovesathi</h1>
          <CardDescription className="text-sm sm:text-base text-gray-300">
            Join thousands finding meaningful connections
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-6">
          <Tabs defaultValue="signup" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12 sm:h-10 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="signup" className="text-sm font-medium data-[state=active]:shadow-sm transition-all rounded-md flex items-center justify-center">
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="login" className="text-sm font-medium data-[state=active]:shadow-sm transition-all rounded-md flex items-center justify-center">
                Login
              </TabsTrigger>
            </TabsList>

            {/* ---------- SIGNUP ---------- */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" required value={formData.name} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" required value={formData.email} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <GoogleLoginButton />
                  <AppleLoginButton />
                </div>
              </div>
            </TabsContent>

            {/* ---------- LOGIN ---------- */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" required value={formData.email} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex items-center justify-between">
                  <Button asChild variant="link" className="px-0 text-sm">
                    <a href="/auth/forgot-password">Forgot password?</a>
                  </Button>
                </div>

                <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                  {isLoading ? "Logging In..." : "Login"}
                </Button>
              </form>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <GoogleLoginButton />
                  <AppleLoginButton />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-xs text-gray-400">
            By continuing, you agree to our{" "}
            <Button variant="link" className="p-0 h-auto text-xs text-white hover:text-gray-300">Terms of Service</Button>{" "}
            and{" "}
            <Button variant="link" className="p-0 h-auto text-xs text-white hover:text-gray-300">Privacy Policy</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
