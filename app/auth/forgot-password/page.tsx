"use client";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // ✅ Send OTP to email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) return toast.error(data.error);

    toast.success("OTP sent to your email!");
    setStep("verify");
    setTimeout(() => otpInputs.current[0]?.focus(), 200);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    const newValue = value.replace(/[^\d]/g, '');
    
    if (newValue.length === 0) {
      // If cleared, just update the state
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Take only the last digit if multiple chars somehow entered
    const digit = newValue.slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    
    // Focus next input BEFORE state update to avoid any blocking
    if (digit && index < 3) {
      const nextInput = otpInputs.current[index + 1];
      if (nextInput) {
        // Focus immediately
        nextInput.focus();
        nextInput.select();
      }
    }
    
    // Update state after focusing
    setOtp(newOtp);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      
      const newOtp = [...otp];
      
      if (otp[index]) {
        // If current input has a value, clear it
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // If current input is empty, go back to previous
        const prevInput = otpInputs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
        // Clear previous value
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    
    // Only handle if pasted data is 4 digits
    if (/^\d{4}$/.test(pasteData)) {
      const newOtp = pasteData.split("").slice(0, 4);
      setOtp(newOtp);
      otpInputs.current[3]?.focus();
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const code = otp.join("");
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: code }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) return toast.error(data.error);

    toast.success("OTP Verified ✅");
    setStep("reset");
  };

  // ✅ Reset password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    setIsLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) return toast.error(data.error);

    toast.success("Password updated ✅");
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {step === "request" ? "Forgot password" : step === "verify" ? "Verify OTP" : "Reset password"}
          </h1>
          <CardDescription>
            {step === "request" && "Enter your email to get OTP"}
            {step === "verify" && "Enter 4-digit OTP sent to your email"}
            {step === "reset" && "Set a new password"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "request" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Label>Enter OTP</Label>

              <div className="flex gap-2 justify-center mb-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      if (el) otpInputs.current[i] = el;
                    }}                    
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onInput={(e) => {
                      // Ensure only digits are entered
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^\d]/g, '');
                    }}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    onFocus={(e) => e.target.select()}
                    className="w-12 h-12 text-center text-xl border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    inputMode="numeric"
                    pattern="[0-9]"
                    type="text"
                    autoComplete="off"
                  />
                ))}
              </div>

              <Button className="w-full" disabled={otp.some((d) => !d) || isLoading}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-2 top-2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-2 top-2" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <Button className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Reset Password"}
              </Button>

              <Separator />
              <Button asChild variant="link" className="w-full">
                <a href="/auth">Back to login</a>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
