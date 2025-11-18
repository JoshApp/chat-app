"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface SparkBackButtonProps {
  targetUserId: string
  onSparkBack: (emoji: string) => Promise<boolean>
  className?: string
}

const SPARK_OPTIONS = [
  { emoji: "👋", label: "Hi" },
  { emoji: "❤️", label: "Like" },
  { emoji: "😏", label: "Flirt" },
  { emoji: "🔥", label: "Intense" },
]

export function SparkBackButton({
  targetUserId,
  onSparkBack,
  className,
}: SparkBackButtonProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [sending, setSending] = useState(false)

  const handleEmojiSelect = async (emoji: string) => {
    setSending(true)
    const success = await onSparkBack(emoji)
    setSending(false)
    if (success) {
      setShowPicker(false)
    }
  }

  if (showPicker) {
    return (
      <div className={className}>
        <p className="text-xs text-muted-foreground mb-2 text-center">
          Choose your spark:
        </p>
        <div className="grid grid-cols-4 gap-2">
          {SPARK_OPTIONS.map((option) => (
            <Button
              key={option.emoji}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => handleEmojiSelect(option.emoji)}
              disabled={sending}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-xs">{option.label}</span>
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPicker(false)}
          className="w-full mt-2"
          disabled={sending}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => setShowPicker(true)}
      className={className}
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Spark Back
    </Button>
  )
}
