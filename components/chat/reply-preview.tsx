"use client"

import { X, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Message } from "@/lib/types/database"

interface ReplyPreviewProps {
  message: Message
  senderName: string
  onCancel: () => void
}

export function ReplyPreview({ message, senderName, onCancel }: ReplyPreviewProps) {
  // Truncate content to max 80 characters for preview
  const truncateContent = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="border-t border-l-4 border-l-primary bg-muted/30 px-4 py-2 flex items-center gap-3">
      <Reply className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">{senderName}</p>
        <p className="text-sm text-muted-foreground truncate">
          {truncateContent(message.content)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onCancel}
        className="h-8 w-8 flex-shrink-0"
        type="button"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
