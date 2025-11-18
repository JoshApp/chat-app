"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { SparkEmoji } from "@/lib/types/database"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface SparkButtonProps {
  targetUserId: string
  onSparkSent?: (emoji: SparkEmoji, mutualSpark: boolean) => void
  quotaRemaining: number
  isPremium: boolean
  className?: string
}

const sparkOptions: Array<{
  emoji: SparkEmoji
  label: string
  description: string
}> = [
  { emoji: "👋", label: "Hi", description: "Friendly greeting" },
  { emoji: "❤️", label: "Like", description: "I'm interested" },
  { emoji: "😏", label: "Flirt", description: "Playful energy" },
  { emoji: "🔥", label: "Intense", description: "High chemistry" },
]

export function SparkButton({
  targetUserId,
  onSparkSent,
  quotaRemaining,
  isPremium,
  className,
}: SparkButtonProps) {
  const [sending, setSending] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const canSendSpark = isPremium || quotaRemaining > 0

  const handleSparkClick = async (emoji: SparkEmoji) => {
    if (!canSendSpark) {
      toast.error("Daily reaction limit reached! Upgrade to premium for unlimited reactions.")
      return
    }

    setSending(true)
    setShowOptions(false)

    try {
      const response = await fetch("/api/sparks/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          emoji,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reaction")
      }

      if (data.mutualSpark) {
        toast.success("🎉 Mutual spark! You can now chat!")
      } else {
        toast.success(`${emoji} Spark sent!`)
      }

      onSparkSent?.(emoji, data.mutualSpark)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reaction")
    } finally {
      setSending(false)
    }
  }

  if (!showOptions) {
    return (
      <Button
        onClick={() => setShowOptions(true)}
        disabled={sending || !canSendSpark}
        className={cn("relative", className)}
        variant="default"
      >
        ✨ Send Spark
        {!isPremium && (
          <span className="ml-2 text-xs opacity-70">({quotaRemaining} left)</span>
        )}
      </Button>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Choose your spark:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(false)}
          className="h-6 px-2"
        >
          Cancel
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {sparkOptions.map((option) => (
          <Button
            key={option.emoji}
            onClick={() => handleSparkClick(option.emoji)}
            disabled={sending}
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <span className="text-2xl">{option.emoji}</span>
            <span className="text-xs font-medium">{option.label}</span>
            <span className="text-xs text-muted-foreground">{option.description}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
