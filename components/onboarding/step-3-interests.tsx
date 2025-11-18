"use client"

import { InterestTagPicker } from "@/components/interest-tags"
import { Button } from "@/components/ui/button"

interface Step3InterestsProps {
  selectedInterests: string[]
  setSelectedInterests: (interests: string[]) => void
  onSkip: () => void
}

export function Step3Interests({
  selectedInterests,
  setSelectedInterests,
  onSkip,
}: Step3InterestsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">What are you into?</h2>
        <p className="text-muted-foreground">
          Select up to 3 interests to help people know what you're looking for
        </p>
      </div>

      <InterestTagPicker
        selectedTags={selectedInterests}
        onTagsChange={setSelectedInterests}
        maxTags={3}
      />

      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </Button>
      </div>
    </div>
  )
}
