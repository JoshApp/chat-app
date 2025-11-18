"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InlineSparkPickerProps {
  onSelectEmoji: (emoji: string) => void
  disabled?: boolean
  className?: string
}

const SPARK_OPTIONS = [
  { emoji: "👋", label: "Hi", description: "Friendly greeting" },
  { emoji: "❤️", label: "Like", description: "I'm interested" },
  { emoji: "😏", label: "Flirt", description: "Playful energy" },
  { emoji: "🔥", label: "Intense", description: "High chemistry" },
]

export function InlineSparkPicker({
  onSelectEmoji,
  disabled = false,
  className,
}: InlineSparkPickerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-center">Choose your spark:</p>
      <div className="grid grid-cols-2 gap-3">
        {SPARK_OPTIONS.map((option) => (
          <Button
            key={option.emoji}
            variant="outline"
            className={cn(
              "h-auto flex flex-col items-center gap-2 p-4",
              "hover:bg-primary/10 hover:border-primary/50 hover:scale-105",
              "transition-all duration-200"
            )}
            onClick={() => onSelectEmoji(option.emoji)}
            disabled={disabled}
          >
            <span className="text-3xl">{option.emoji}</span>
            <div className="text-center">
              <p className="font-medium text-sm">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
