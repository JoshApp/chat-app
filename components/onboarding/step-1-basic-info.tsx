"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface Step1BasicInfoProps {
  username: string
  setUsername: (value: string) => void
  age: string
  setAge: (value: string) => void
  ageConfirmed: boolean
  setAgeConfirmed: (value: boolean) => void
  termsAccepted: boolean
  setTermsAccepted: (value: boolean) => void
}

export function Step1BasicInfo({
  username,
  setUsername,
  age,
  setAge,
  ageConfirmed,
  setAgeConfirmed,
  termsAccepted,
  setTermsAccepted,
}: Step1BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome! Let's get started</h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            maxLength={20}
          />
          <p className="text-xs text-muted-foreground">
            3-20 characters, letters, numbers, and underscores only
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Select value={age} onValueChange={setAge}>
            <SelectTrigger id="age">
              <SelectValue placeholder="Select your age" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 83 }, (_, i) => i + 18).map((ageOption) => (
                <SelectItem key={ageOption} value={ageOption.toString()}>
                  {ageOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="age-confirm"
              checked={ageConfirmed}
              onCheckedChange={(checked) => setAgeConfirmed(checked === true)}
            />
            <label
              htmlFor="age-confirm"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm that I am 18 years or older
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept the{" "}
              <Link href="/terms" target="_blank" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
