"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Step1BasicInfo } from "./step-1-basic-info"
import { Step2Vibe } from "./step-2-vibe"
import { Step3Interests } from "./step-3-interests"
import { Step4Status } from "./step-4-status"
import type { Vibe } from "@/lib/types/database"
import toast from "react-hot-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface OnboardingWizardProps {
  mode: "guest" | "email"
  email?: string
  password?: string
  onComplete: (data: OnboardingData) => Promise<void>
}

export interface OnboardingData {
  username: string
  age: number
  vibe: Vibe
  interests: string[]
  statusLine: string
  ageConfirmed: boolean
  termsAccepted: boolean
  email?: string
  password?: string
}

const TOTAL_STEPS = 4

export function OnboardingWizard({ mode, email, password, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Step 1: Basic info
  const [username, setUsername] = useState("")
  const [age, setAge] = useState("")
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Step 2: Vibe
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null)

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  // Step 4: Status
  const [statusLine, setStatusLine] = useState("")

  const canProceedFromStep1 = () => {
    if (!username.trim()) {
      toast.error("Please enter a username")
      return false
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters")
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("Username can only contain letters, numbers, and underscores")
      return false
    }
    if (!age) {
      toast.error("Please select your age")
      return false
    }
    if (parseInt(age) < 18) {
      toast.error("You must be at least 18 years old")
      return false
    }
    if (!ageConfirmed) {
      toast.error("Please confirm you are 18 or older")
      return false
    }
    if (!termsAccepted) {
      toast.error("Please accept the terms of service")
      return false
    }
    return true
  }

  const canProceedFromStep2 = () => {
    if (!selectedVibe) {
      toast.error("Please select a vibe")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && !canProceedFromStep1()) return
    if (currentStep === 2 && !canProceedFromStep2()) return

    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSkipStep3 = () => {
    setSelectedInterests([])
    setCurrentStep(4)
  }

  const handleSkipStep4 = () => {
    setStatusLine("")
    handleSubmit()
  }

  const handleSubmit = async () => {
    if (!selectedVibe) {
      toast.error("Please select a vibe")
      return
    }

    setSubmitting(true)

    try {
      const data: OnboardingData = {
        username,
        age: parseInt(age),
        vibe: selectedVibe,
        interests: selectedInterests,
        statusLine: statusLine.trim(),
        ageConfirmed,
        termsAccepted,
      }

      // Add email/password for email mode
      if (mode === "email" && email && password) {
        data.email = email
        data.password = password
      }

      await onComplete(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete signup")
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            username={username}
            setUsername={setUsername}
            age={age}
            setAge={setAge}
            ageConfirmed={ageConfirmed}
            setAgeConfirmed={setAgeConfirmed}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
          />
        )
      case 2:
        return (
          <Step2Vibe
            selectedVibe={selectedVibe}
            setSelectedVibe={setSelectedVibe}
          />
        )
      case 3:
        return (
          <Step3Interests
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
            onSkip={handleSkipStep3}
          />
        )
      case 4:
        return (
          <Step4Status
            statusLine={statusLine}
            setStatusLine={setStatusLine}
            selectedVibe={selectedVibe}
            onSkip={handleSkipStep4}
          />
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm font-medium">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || submitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={submitting}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Complete"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
