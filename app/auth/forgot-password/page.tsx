"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { StaticBackground } from "@/components/discovery/static-background";

export const dynamic = "force-dynamic";


export default function ForgotPasswordPage() {
  const router = useRouter();
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

    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setIsLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) return toast.error(data.error || "Password reset failed");

    // ✅ Success toast with better messaging
    toast.success("Password reset successful! Redirecting to login...", {
      duration: 2000,
    });
    
    // ✅ Replace history entry to prevent back button issues
    setTimeout(() => {
      router.replace("/auth");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <StaticBackground />
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-black/10 relative z-10">
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          onClick={() => router.push("/auth")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-bold text-black">
          {step === "request" ? "Forgot password" : step === "verify" ? "Verify OTP" : "Reset password"}
        </h2>
        <div className="w-9" /> {/* Spacer for center alignment */}
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8 overflow-y-auto relative z-10">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              {step === "request" ? "Forgot password" : step === "verify" ? "Verify OTP" : "Reset password"}
            </h1>
            <p className="text-base text-black/70">
              {step === "request" && "Enter your email to get OTP"}
              {step === "verify" && "Enter 4-digit OTP sent to your email"}
              {step === "reset" && "Set a new password"}
            </p>
          </div>

          {step === "request" && (
            <form onSubmit={handleSendCode} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </div>

              <Button className="w-full font-semibold" type="submit" size="lg" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-4">
              <div className="space-y-2">
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
              </div>

              <Button className="w-full font-semibold" size="lg" disabled={otp.some((d) => !d) || isLoading}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleReset} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-black/70"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button className="w-full font-semibold" size="lg" disabled={isLoading}>
                {isLoading ? "Updating..." : "Reset Password"}
              </Button>

              <Separator />
              <Button asChild variant="link" className="w-full">
                <Link href="/auth">Back to login</Link>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
