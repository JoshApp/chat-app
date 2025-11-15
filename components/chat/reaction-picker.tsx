"use client"

import { cn } from "@/lib/utils"
import Twemoji from "react-twemoji"

interface ReactionPickerProps {
  onReactionClick: (emoji: string) => void
  selectedEmojis?: string[]
  className?: string
}

// Adult chat reaction set
const REACTIONS = ["❤️", "😍", "😏", "🔥", "🤤", "🥵", "😂", "😈"]

export function ReactionPicker({ onReactionClick, selectedEmojis = [], className }: ReactionPickerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-popover border rounded-full px-2 py-1.5 shadow-lg whitespace-nowrap",
        className
      )}
    >
      {REACTIONS.map((emoji) => {
        const isSelected = selectedEmojis.includes(emoji)

        return (
          <button
            key={emoji}
            onClick={(e) => {
              e.stopPropagation()
              onReactionClick(emoji)
            }}
            className={cn(
              "rounded-full p-2 transition-all flex items-center justify-center",
              isSelected
                ? "bg-primary/20 ring-2 ring-primary hover:bg-destructive/20 hover:ring-destructive"
                : "hover:bg-accent"
            )}
            title={isSelected ? `Remove ${emoji}` : `React with ${emoji}`}
          >
            <div className="w-5 h-5">
              <Twemoji options={{ className: "w-full h-full" }}>
                <span>{emoji}</span>
              </Twemoji>
            </div>
          </button>
        )
      })}
    </div>
  )
}
