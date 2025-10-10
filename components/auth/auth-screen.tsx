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
interface AuthScreenProps {
  onAuthSuccess?: () => void
}
export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    if (onAuthSuccess) {
      onAuthSuccess()
    } else {
      router.push("/onboarding/verification")
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 pt-6 sm:pt-6">
          <div className="flex items-center justify-center">
            <h1 className="text-xl sm:text-2xl font-bold text-primary font-sans">Lovesathi</h1>
          </div>
          <CardDescription className="text-sm sm:text-base">Join thousands finding meaningful connections</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-6">
          <Tabs defaultValue="signup" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12 sm:h-10 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger 
                value="signup" 
                className="text-sm sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-md min-h-[40px] sm:min-h-[36px] flex items-center justify-center"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger 
                value="login" 
                className="text-sm sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-md min-h-[40px] sm:min-h-[36px] flex items-center justify-center"
              >
                Login
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signup" className="space-y-4 sm:space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-primary">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" required className="text-primary placeholder:text-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-primary">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" required className="text-primary placeholder:text-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-primary">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" required className="text-primary placeholder:text-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-primary">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      required
                      className="text-primary placeholder:text-primary"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 sm:h-10 font-medium" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <GoogleLoginButton />
                  <AppleLoginButton />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="login" className="space-y-4 sm:space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-primary">Email or Phone</Label>
                  <Input id="signin-email" placeholder="Enter your email or phone" required className="text-primary placeholder:text-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-primary">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      className="text-primary placeholder:text-primary"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Button asChild variant="link" className="px-0 text-sm">
                    <a href="/auth/forgot-password">Forgot password?</a>
                  </Button>
                </div>
                <Button type="submit" className="w-full h-11 sm:h-10 font-medium" disabled={isLoading}>
                  {isLoading ? "Logging In..." : "Login"}
                </Button>
              </form>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <GoogleLoginButton />
                  <AppleLoginButton />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Button variant="link" className="p-0 h-auto text-xs text-primary">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="p-0 h-auto text-xs text-primary">
              Privacy Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}











