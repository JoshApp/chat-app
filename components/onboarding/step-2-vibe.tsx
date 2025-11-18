"use client"

import { VibeSelector } from "@/components/vibe"
import type { Vibe } from "@/lib/types/database"

interface Step2VibeProps {
  selectedVibe: Vibe | null
  setSelectedVibe: (vibe: Vibe) => void
}

export function Step2Vibe({ selectedVibe, setSelectedVibe }: Step2VibeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">What's your vibe?</h2>
        <p className="text-muted-foreground">
          This helps us match you with people who want the same energy
        </p>
      </div>

      <VibeSelector
        selectedVibe={selectedVibe}
        onSelectVibe={setSelectedVibe}
      />
    </div>
  )
}
