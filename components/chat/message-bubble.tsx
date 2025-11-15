import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { TwemojiText } from "@/components/ui/twemoji-text"
import { ReactionPicker } from "./reaction-picker"
import { MessageReactions, type MessageReaction } from "./message-reactions"
import { useState, useEffect, useRef } from "react"

export type MessageGroupPosition = "single" | "first" | "middle" | "last"

interface MessageBubbleProps {
  messageId: string
  content: string
  isMine: boolean
  timestamp: string
  username?: string
  groupPosition?: MessageGroupPosition
  reactions?: MessageReaction[]
  currentUserId: string
  onReactionToggle: (messageId: string, emoji: string) => void
}

export function MessageBubble({
  messageId,
  content,
  isMine,
  timestamp,
  username,
  groupPosition = "single",
  reactions = [],
  currentUserId,
  onReactionToggle,
}: MessageBubbleProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const isFirst = groupPosition === "first" || groupPosition === "single"
  const isLast = groupPosition === "last" || groupPosition === "single"
  const isSingle = groupPosition === "single"
  const isMiddle = groupPosition === "middle"

  // Spacing between messages - no gap for grouped messages
  const spacing = isSingle || isLast ? "mb-4" : "mb-0.5"

  // Rounded corners based on position in group
  // Pattern creates "flowing stairs" effect like WhatsApp/Telegram
  // Outgoing (right): cut right corners progressively
  // Incoming (left): cut left corners progressively
  const roundedClasses = cn(
    // Single message - all corners rounded
    isSingle && "rounded-2xl",

    // Outgoing messages (right-aligned)
    isMine && groupPosition === "first" && "rounded-2xl rounded-br-sm",
    isMine && isMiddle && "rounded-xl rounded-tr-sm rounded-br-sm",
    isMine && groupPosition === "last" && "rounded-2xl rounded-tr-sm",

    // Incoming messages (left-aligned)
    !isMine && groupPosition === "first" && "rounded-2xl rounded-bl-sm",
    !isMine && isMiddle && "rounded-xl rounded-tl-sm rounded-bl-sm",
    !isMine && groupPosition === "last" && "rounded-2xl rounded-tl-sm"
  )

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showPicker])

  const handleReactionClick = (emoji: string) => {
    onReactionToggle(messageId, emoji)
    setShowPicker(false)
  }

  return (
    <div className={cn("flex gap-2", spacing, isMine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[70%]")}>
        {/* Username only on first message in group */}
        {!isMine && username && isFirst && (
          <div className="text-xs font-medium text-muted-foreground px-3 mb-1">{username}</div>
        )}

        {/* Message bubble with timestamp inside */}
        <div className="relative">
          <div
            className={cn(
              "px-4 py-2 break-words relative group transition-colors",
              roundedClasses,
              isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80",
              !isMine && "cursor-pointer"
            )}
            onClick={() => {
              if (!isMine) setShowPicker(!showPicker)
            }}
          >
            {/* Content - only add padding for timestamp if this is last/single message */}
            <div className={cn((isLast || isSingle) && "pr-14")}>
              <TwemojiText>{content}</TwemojiText>
            </div>

            {/* Timestamp in corner - only on last message in group */}
            {(isLast || isSingle) && (
              <div
                className={cn(
                  "absolute bottom-1 right-2 text-[10px] opacity-60",
                  isMine ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {format(new Date(timestamp), "h:mm a")}
              </div>
            )}
          </div>

          {/* Reaction Picker - shows on click */}
          {showPicker && (
            <div
              ref={pickerRef}
              className={cn("absolute top-full mt-1 z-10", isMine ? "right-0" : "left-0")}
            >
              <ReactionPicker
                onReactionClick={handleReactionClick}
                selectedEmojis={reactions
                  .filter((r) => r.user_id === currentUserId)
                  .map((r) => r.emoji)}
              />
            </div>
          )}

          {/* Display existing reactions */}
          <MessageReactions
            reactions={reactions}
            currentUserId={currentUserId}
            onReactionClick={handleReactionClick}
          />
        </div>
      </div>
    </div>
  )
}
