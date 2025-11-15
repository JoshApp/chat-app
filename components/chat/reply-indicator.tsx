"use client"

import { TwemojiText } from "@/components/ui/twemoji-text"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types/database"

interface ReplyIndicatorProps {
  parentMessage: Message | null
  senderName?: string
  onClick?: () => void
  isMine: boolean
}

export function ReplyIndicator({ parentMessage, senderName, onClick, isMine }: ReplyIndicatorProps) {
  // Truncate content to max 100 characters
  const truncateContent = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (!parentMessage) {
    // Parent message was deleted or not available
    return (
      <div
        className={cn(
          "mb-2 pl-2 border-l-2 border-muted-foreground/30 text-xs italic",
          isMine ? "text-primary-foreground/60" : "text-muted-foreground"
        )}
      >
        Message deleted
      </div>
    )
  }

  return (
    <div
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation()
          onClick()
        }
      }}
      className={cn(
        "mb-2 pl-2 border-l-2 text-xs",
        isMine ? "border-primary-foreground/30" : "border-primary/30",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity"
      )}
    >
      <div
        className={cn(
          "font-medium",
          isMine ? "text-primary-foreground/80" : "text-foreground/80"
        )}
      >
        {senderName || "User"}
      </div>
      <div
        className={cn(
          "truncate",
          isMine ? "text-primary-foreground/60" : "text-muted-foreground"
        )}
      >
        <TwemojiText>{truncateContent(parentMessage.content)}</TwemojiText>
      </div>
    </div>
  )
}
