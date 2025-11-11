"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"
import Link from "next/link"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(false)
  const [showAgeModal, setShowAgeModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Guest signup form
  const [username, setUsername] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Email login/signup form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (!loading && user) {
      router.push("/app")
    }
  }, [user, loading, router])

  const handleGuestSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ageConfirmed || !termsAccepted) {
      toast.error("Please confirm you are 18+ and accept the terms")
      return
    }

    if (parseInt(age) < 18) {
      toast.error("You must be at least 18 years old")
      return
    }

    setShowAgeModal(true)
  }

  const confirmGuestSignup = async () => {
    setSubmitting(true)

    try {
      const response = await fetch("/api/auth/guest-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          gender,
          age: parseInt(age),
          ageConfirmed: true,
          termsAccepted: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      if (data.username !== username) {
        toast.success(`Welcome! Your username is ${data.username}`)
      } else {
        toast.success("Welcome! Redirecting to chat...")
      }

      // Refresh the page to pick up the new session
      window.location.href = "/app"
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account")
      setShowAgeModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setSubmitting(true)

    try {
      const endpoint = isLogin ? "/api/auth/email-login" : "/api/auth/email-signup"
      const payload = isLogin
        ? { email, password }
        : {
            username,
            email,
            password,
            gender,
            age: parseInt(age),
            ageConfirmed: true,
            termsAccepted: true,
          }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      toast.success(isLogin ? "Welcome back!" : "Account created!")

      // Refresh the page to pick up the new session
      window.location.href = "/app"
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed")
    } finally {
      setSubmitting(false)
    }
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

  // If user is authenticated, show loading while redirecting (prevents flash)
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
              Chat Freely.<br />Chat Anonymously.
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with others instantly. No judgement, no barriers.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">Anonymous & Fast</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">Real-time Messaging</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">18+ Only Community</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">Safe & Moderated</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-muted/30">
          <div className="w-full max-w-md">
            {!isLogin ? (
              /* Guest Signup Form */
              <Card>
                <CardHeader>
                  <CardTitle>Start Chatting Now</CardTitle>
                  <CardDescription>
                    No email required. Choose a username and dive in!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGuestSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                        maxLength={20}
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Select value={age} onValueChange={setAge} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your age" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 83 }, (_, i) => i + 18).map((ageNum) => (
                            <SelectItem key={ageNum} value={ageNum.toString()}>
                              {ageNum}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="age-confirm"
                          checked={ageConfirmed}
                          onChange={(e) => setAgeConfirmed(e.target.checked)}
                          className="mt-1"
                        />
                        <Label htmlFor="age-confirm" className="text-sm font-normal">
                          I confirm I am 18 years or older
                        </Label>
                      </div>

                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1"
                        />
                        <Label htmlFor="terms" className="text-sm font-normal">
                          I accept the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                      {submitting ? "Creating account..." : "Continue as Guest"}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className="text-primary hover:underline"
                      >
                        Login with email
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              /* Email Login Form */
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Login with your email and password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                      {submitting ? "Logging in..." : "Login"}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className="text-primary hover:underline"
                      >
                        Continue as guest
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/guidelines" className="hover:text-foreground">
              Community Guidelines
            </Link>
          </div>
        </div>
      </footer>

      {/* Age Confirmation Modal */}
      <Dialog open={showAgeModal} onOpenChange={setShowAgeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Age Confirmation</DialogTitle>
            <DialogDescription>
              This is an adult chat platform. By continuing, you confirm that you are at least 18
              years old and agree to our Terms of Service and Community Guidelines.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAgeModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={confirmGuestSignup} disabled={submitting}>
              {submitting ? "Creating account..." : "I Agree - Enter Chat"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
