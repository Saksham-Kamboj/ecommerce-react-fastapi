import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authApi } from "@/lib/api/auth"

export function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      await authApi.sendOtp(email)
      setSuccess("An OTP has been sent to your email address.")
      setStep(2)
    } catch (err) {
      const error = err as Error
      setError(error.message || "Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      await authApi.resetPassword(email, otpCode, newPassword)
      setSuccess("Password reset successfully. Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      const error = err as Error
      setError(
        error.message ||
          "Failed to reset password. Please check your OTP and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          {step === 1
            ? "Enter your email address and we'll send you an OTP to reset your password."
            : "Enter the OTP sent to your email and your new password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-600 dark:bg-green-950/50 dark:text-green-400">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form className="grid gap-4" onSubmit={handleSendOtp}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={handleResetPassword}>
              <div className="grid gap-2">
                <Label htmlFor="otp">6-Digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back to Email
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            Remembered your password?{" "}
            <Link to="/login" className="underline hover:text-primary">
              Sign in
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
