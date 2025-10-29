"use client"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Lock } from "lucide-react"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "verify" | "reset">("request")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [showOtpInputs, setShowOtpInputs] = useState(false)
  const otpInputs = useRef<(HTMLInputElement | null)[]>([])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate sending code
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setShowOtpInputs(true)
    // Focus first OTP input after animation
    setTimeout(() => {
      otpInputs.current[0]?.focus()
    }, 100)
  }

  const handleOtpChange = (index: number, value: string) => {
    // Take only the last character typed (handles paste or multiple chars)
    const digit = value.slice(-1)
    
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) return

    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // Auto-focus next input when a digit is entered
    if (digit && index < 3) {
      setTimeout(() => {
        otpInputs.current[index + 1]?.focus()
        otpInputs.current[index + 1]?.select()
      }, 0)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty and clear it
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
        setTimeout(() => {
          otpInputs.current[index - 1]?.focus()
          otpInputs.current[index - 1]?.select()
        }, 0)
      }
    }
  }

  const handleOtpFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Auto-select the content when focusing for easy replacement
    e.target.select()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate OTP verification
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setStep("reset")
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    window.location.href = "/auth"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {step === "request" ? "Forgot password" : step === "verify" ? "Verify code" : "Set new password"}
          </h1>
          <CardDescription>
            {step === "request"
              ? "Enter your email to receive a verification code."
              : step === "verify"
              ? "Enter the 4-digit code sent to your email."
              : "Choose a strong password and confirm it to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "request" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-email" className="text-primary">Email</Label>
                <Input 
                  id="fp-email" 
                  type="email" 
                  placeholder="Enter your email" 
                  required 
                  className="text-primary placeholder:text-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              {/* OTP Inputs - Show after clicking Send Code */}
              {showOtpInputs && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-500">
                  <div className="space-y-2">
                    <Label className="text-primary text-center block">Verification Code</Label>
                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => (otpInputs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onFocus={handleOtpFocus}
                          autoComplete="off"
                          className="w-12 h-12 text-center text-xl font-semibold text-primary sm:w-14 sm:h-14"
                        />
                      ))}
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    className="w-full" 
                    disabled={isLoading || otp.some(d => !d)}
                    onClick={handleVerifyOtp}
                  >
                    {isLoading ? "Verifying..." : "Submit"}
                  </Button>
                </div>
              )}
              
              {/* Send Code Button - Hide after OTP inputs appear */}
              {!showOtpInputs && (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send code"}
                </Button>
              )}
              
              <div className="flex justify-center">
                <Button asChild variant="link" className="text-sm">
                  <a href="/auth">Back to login</a>
                </Button>
              </div>
            </form>
          ) : step === "verify" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-primary text-center block">Verification Code</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onFocus={handleOtpFocus}
                      autoComplete="off"
                      className="w-12 h-12 text-center text-xl font-semibold text-primary sm:w-14 sm:h-14"
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || otp.some(d => !d)}>
                {isLoading ? "Verifying..." : "Submit"}
              </Button>
              <div className="flex justify-center">
                <Button asChild variant="link" className="text-sm">
                  <a href="/auth">Back to login</a>
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-primary">New password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a new password"
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
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-primary">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter the new password"
                    required
                    className="text-primary placeholder:text-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update password"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Remembered your password?</span>
                </div>
              </div>
              <div className="flex justify-center">
                <Button asChild variant="link" className="text-sm">
                  <a href="/auth">Back to login</a>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


