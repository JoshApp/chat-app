"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { Vibe } from "@/lib/types/database"

interface Step4StatusProps {
  statusLine: string
  setStatusLine: (status: string) => void
  selectedVibe: Vibe | null
  onSkip: () => void
}

const statusPlaceholders: Record<Vibe, string[]> = {
  soft: [
    "Patient and gentle, here for real connection...",
    "Soft energy, loves building trust slowly...",
    "Looking for emotional depth and tenderness...",
  ],
  flirty: [
    "Playful energy, loves teasing and banter...",
    "Here for fun vibes and flirty conversations...",
    "Light-hearted and charming, let's vibe...",
  ],
  spicy: [
    "Looking for intensity and chemistry...",
    "Bold and direct, knows what I want...",
    "Spicy conversations and passionate energy...",
  ],
  intense: [
    "Direct and raw, no games...",
    "High-intensity energy, no limits...",
    "Unapologetically intense, ready for anything...",
  ],
}

function getPlaceholder(vibe: Vibe | null): string {
  if (!vibe) return "Say something about your energy..."
  const options = statusPlaceholders[vibe]
  return options[Math.floor(Math.random() * options.length)]
}

export function Step4Status({
  statusLine,
  setStatusLine,
  selectedVibe,
  onSkip,
}: Step4StatusProps) {
  const placeholder = getPlaceholder(selectedVibe)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Add a status line</h2>
        <p className="text-muted-foreground">
          Give people a quick sense of your energy (optional, max 100 characters)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Your status</Label>
        <Textarea
          id="status"
          value={statusLine}
          onChange={(e) => setStatusLine(e.target.value.slice(0, 100))}
          placeholder={placeholder}
          rows={3}
          maxLength={100}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>This will be visible on your profile</span>
          <span>{statusLine.length}/100</span>
        </div>
      </div>

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
