import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { TwemojiText } from "@/components/ui/twemoji-text"
import { ReactionPicker } from "./reaction-picker"
import { MessageReactions, type MessageReaction } from "./message-reactions"
import { ReplyIndicator } from "./reply-indicator"
import { ActionSheet } from "./action-sheet"
import { useState, useEffect, useRef, forwardRef } from "react"
import type { Message, MessageSendState } from "@/lib/types/database"
import { Reply, Clock, Check, CheckCheck, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

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
  parentMessage?: Message | null
  parentMessageSenderName?: string
  onReply?: () => void
  onScrollToParent?: () => void
  onReport?: () => void
  sendState?: MessageSendState
  onRetry?: () => void
  readAt?: string | null
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  (
    {
      messageId,
      content,
      isMine,
      timestamp,
      username,
      groupPosition = "single",
      reactions = [],
      currentUserId,
      onReactionToggle,
      parentMessage,
      parentMessageSenderName,
      onReply,
      onScrollToParent,
      onReport,
      sendState,
      onRetry,
      readAt,
    },
    ref
  ) => {
    const [showPicker, setShowPicker] = useState(false)
    const [showActionSheet, setShowActionSheet] = useState(false)
    const pickerRef = useRef<HTMLDivElement>(null)
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
    const touchStartPosRef = useRef<{ x: number; y: number } | null>(null)
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

  // Long-press handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }

    longPressTimerRef.current = setTimeout(() => {
      // Vibrate on long-press if supported
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      setShowActionSheet(true)
    }, 500) // 500ms long-press threshold
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long-press if user scrolls
    if (longPressTimerRef.current && touchStartPosRef.current) {
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x)
      const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y)

      // If moved more than 10px, cancel long-press
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }

  const handleTouchEnd = () => {
    // Clear long-press timer if touch ends before threshold
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    touchStartPosRef.current = null
  }

  // Copy message handler
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success("Message copied to clipboard")
  }

  // Report handler
  const handleReport = () => {
    if (onReport) {
      onReport()
    }
  }

  return (
    <div
      ref={ref}
      className={cn("flex gap-2 min-w-0", spacing, isMine ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[70%] min-w-0")}>
        {/* Username only on first message in group */}
        {!isMine && username && isFirst && (
          <div className="text-xs font-medium text-muted-foreground px-3 mb-1">{username}</div>
        )}

        {/* Message bubble with timestamp inside - extended hover zone */}
        <div
          className={cn(
            "relative group min-w-0",
            // Extend hover zone to include button area
            isMine ? "pl-12" : "pr-12"
          )}
        >
          {/* Reply button - shows on hover (desktop only) */}
          {onReply && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReply()
              }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                "items-center justify-center",
                "w-10 h-10 rounded-full",
                "bg-muted/95 border shadow-lg",
                "hover:bg-accent hover:scale-110",
                "transition-all duration-200",
                "z-10",
                // Hidden by default, show on group hover (desktop only)
                "hidden md:group-hover:flex",
                // Position at edge of extended hover zone
                isMine ? "left-0" : "right-0"
              )}
              title="Reply to message"
              aria-label="Reply to message"
            >
              <Reply className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          <div
            className={cn(
              "px-4 py-2 break-words overflow-wrap-anywhere relative group transition-colors min-w-0",
              roundedClasses,
              isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80",
              !isMine && "cursor-pointer"
            )}
            style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
            onClick={() => {
              if (!isMine) setShowPicker(!showPicker)
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Reply Indicator - only show if this message is a reply */}
            {parentMessage !== undefined && (
              <ReplyIndicator
                parentMessage={parentMessage}
                senderName={parentMessageSenderName}
                onClick={onScrollToParent}
                isMine={isMine}
              />
            )}

            {/* Content - only add padding for timestamp if this is last/single message */}
            <div className={cn((isLast || isSingle) && "pr-14")}>
              <TwemojiText>{content}</TwemojiText>
            </div>

            {/* Timestamp and send state in corner - only on last message in group */}
            {(isLast || isSingle) && (
              <div
                className={cn(
                  "absolute bottom-1 right-2 text-[10px] opacity-60 flex items-center gap-1",
                  isMine ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {/* Send state indicator (for own messages) */}
                {isMine && (
                  <>
                    {sendState === 'sending' && <Clock className="h-3 w-3 animate-pulse" />}
                    {sendState === 'failed' && <AlertCircle className="h-3 w-3 text-destructive" />}
                    {sendState === 'sent' && readAt && <CheckCheck className="h-3 w-3" />}
                    {sendState === 'sent' && !readAt && <Check className="h-3 w-3" />}
                  </>
                )}
                <span>{format(new Date(timestamp), "h:mm a")}</span>
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

          {/* Failed message retry UI */}
          {isMine && sendState === 'failed' && onRetry && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRetry()
              }}
              className={cn(
                "mt-1 text-xs text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1",
                "cursor-pointer"
              )}
            >
              <AlertCircle className="h-3 w-3" />
              <span>Failed to send • Tap to retry</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Sheet for mobile */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        onReply={onReply}
        onCopy={handleCopy}
        onReport={!isMine ? handleReport : undefined}
        onReact={(emoji) => {
          onReactionToggle(messageId, emoji)
        }}
        selectedEmojis={reactions.filter((r) => r.user_id === currentUserId).map((r) => r.emoji)}
        isMine={isMine}
      />
    </div>
  )
})

MessageBubble.displayName = "MessageBubble"
