"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OnboardingWizard, type OnboardingData } from "@/components/onboarding"
import toast from "react-hot-toast"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [authMode, setAuthMode] = useState<"guest" | "email-signup" | "email-login">("guest")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Email login form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Email signup - store credentials to pass to wizard
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  useEffect(() => {
    if (!loading && user) {
      router.push("/app")
    }
  }, [user, loading, router])

  const handleGuestOnboarding = async (data: OnboardingData) => {
    try {
      const response = await fetch("/api/auth/guest-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account")
      }

      toast.success("Welcome! Redirecting to chat...")
      window.location.href = "/app"
    } catch (error) {
      throw error // Let wizard handle the error
    }
  }

  const handleEmailOnboarding = async (data: OnboardingData) => {
    try {
      const response = await fetch("/api/auth/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account")
      }

      toast.success("Account created! Welcome!")
      window.location.href = "/app"
    } catch (error) {
      throw error // Let wizard handle the error
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/auth/email-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      toast.success("Welcome back!")
      window.location.href = "/app"
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  const startEmailSignup = () => {
    if (!signupEmail || !signupPassword) {
      toast.error("Please enter your email and password")
      return
    }
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setShowOnboarding(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side - Marketing */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Vibe-Based<br />Anonymous Chat
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Match your energy. No labels, just vibes. 18+ only.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">Vibe-matched connections</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">Identity-fluid & inclusive</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">Real-time messaging</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">Safe & anonymous</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-muted/30">
          <div className="w-full max-w-md">
            {authMode === "guest" && !showOnboarding && (
              <Card>
                <CardHeader>
                  <CardTitle>Start Chatting Now</CardTitle>
                  <CardDescription>
                    No email required. Choose your vibe and dive in!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowOnboarding(true)}
                    className="w-full"
                    size="lg"
                  >
                    Continue as Guest
                  </Button>

                  <div className="text-center space-y-2 mt-4">
                    <div className="text-sm text-muted-foreground">
                      Want to save your account?{" "}
                      <button
                        type="button"
                        onClick={() => setAuthMode("email-signup")}
                        className="text-primary hover:underline"
                      >
                        Sign up with email
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setAuthMode("email-login")}
                        className="text-primary hover:underline"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {authMode === "email-signup" && !showOnboarding && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Save your account and come back anytime
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Choose a password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        At least 6 characters
                      </p>
                    </div>

                    <Button
                      onClick={startEmailSignup}
                      className="w-full"
                      size="lg"
                    >
                      Continue
                    </Button>

                    <div className="text-center space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Prefer to stay anonymous?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("guest")}
                          className="text-primary hover:underline"
                        >
                          Continue as guest
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("email-login")}
                          className="text-primary hover:underline"
                        >
                          Login
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {authMode === "email-login" && (
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Login to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? "Logging in..." : "Login"}
                    </Button>

                    <div className="text-center space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("email-signup")}
                          className="text-primary hover:underline"
                        >
                          Sign up
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Want to try first?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("guest")}
                          className="text-primary hover:underline"
                        >
                          Continue as guest
                        </button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Wizard Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Let's set up your vibe and preferences
            </DialogDescription>
          </DialogHeader>
          <OnboardingWizard
            mode={authMode === "guest" ? "guest" : "email"}
            email={signupEmail}
            password={signupPassword}
            onComplete={authMode === "guest" ? handleGuestOnboarding : handleEmailOnboarding}
          />
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="space-x-4">
          <a href="/terms" className="hover:text-foreground">Terms</a>
          <a href="/privacy" className="hover:text-foreground">Privacy</a>
          <a href="/guidelines" className="hover:text-foreground">Guidelines</a>
        </div>
      </footer>
    </div>
  )
}
