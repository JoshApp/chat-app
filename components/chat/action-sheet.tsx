"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Reply, Copy, AlertCircle, X } from "lucide-react"
import { ReactionPicker } from "./reaction-picker"

interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  onReply?: () => void
  onCopy?: () => void
  onReport?: () => void
  onReact?: (emoji: string) => void
  selectedEmojis?: string[]
  isMine: boolean
}

export function ActionSheet({
  isOpen,
  onClose,
  onReply,
  onCopy,
  onReport,
  onReact,
  selectedEmojis = [],
  isMine,
}: ActionSheetProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-background border-t rounded-t-2xl",
          "max-h-[80vh] overflow-y-auto",
          "animate-in slide-in-from-bottom duration-300"
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-4 pb-6">
          {/* Quick Reactions */}
          {onReact && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                Quick React
              </p>
              <div className="flex justify-center">
                <ReactionPicker
                  onReactionClick={(emoji) => {
                    onReact(emoji)
                    onClose()
                  }}
                  selectedEmojis={selectedEmojis}
                />
              </div>
            </div>
          )}

          {/* Divider */}
          {onReact && (onReply || onCopy || (!isMine && onReport)) && (
            <div className="border-t my-4" />
          )}

          {/* Actions */}
          <div className="space-y-1">
            {onReply && (
              <button
                onClick={() => {
                  onReply()
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Reply className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Reply</span>
              </button>
            )}

            {onCopy && (
              <button
                onClick={() => {
                  onCopy()
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Copy className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Copy Message</span>
              </button>
            )}

            {!isMine && onReport && (
              <button
                onClick={() => {
                  onReport()
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Report Message</span>
              </button>
            )}
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
