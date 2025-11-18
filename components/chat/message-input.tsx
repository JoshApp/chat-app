"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Smile } from "lucide-react"
import toast from "react-hot-toast"
import dynamic from "next/dynamic"
import type { EmojiClickData } from "emoji-picker-react"
import type { Message } from "@/lib/types/database"
import { ReplyPreview } from "./reply-preview"
import { useAuth } from "@/lib/contexts/auth-context"

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

interface MessageInputProps {
  conversationId: string
  onMessageSent?: () => void
  replyToMessage?: Message | null
  replyToUsername?: string
  onCancelReply?: () => void
  onAddOptimisticMessage?: (content: string, replyToMessageId?: string) => string | null
  onUpdateMessageState?: (clientId: string, state: 'sent' | 'failed', serverId?: string, error?: string) => void
  onTypingChange?: (isTyping: boolean) => void
}

export function MessageInput({
  conversationId,
  onMessageSent,
  replyToMessage,
  replyToUsername,
  onCancelReply,
  onAddOptimisticMessage,
  onUpdateMessageState,
  onTypingChange,
}: MessageInputProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto"
    // Set height to scrollHeight (but max 120px)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [content])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [showEmojiPicker])

  // Handle content change with typing indicator
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    // Don't track typing for empty input
    if (!newContent.trim()) {
      if (isTyping) {
        onTypingChange?.(false)
        setIsTyping(false)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      return
    }

    // Broadcast typing state
    if (!isTyping) {
      onTypingChange?.(true)
      setIsTyping(true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-clear typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onTypingChange?.(false)
      setIsTyping(false)
    }, 3000)
  }

  const handleSend = async () => {
    if (!content.trim() || sending) return

    const messageContent = content.trim()
    const replyToId = replyToMessage?.id

    // Clear typing state
    if (isTyping) {
      onTypingChange?.(false)
      setIsTyping(false)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Add optimistic message immediately
    const clientId = onAddOptimisticMessage?.(messageContent, replyToId)

    // Clear input and reply state immediately for better UX
    setContent("")
    onCancelReply?.()
    setSending(true)

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: messageContent,
          replyToMessageId: replyToId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const { message } = await response.json()

      // Update optimistic message to sent state
      if (clientId && onUpdateMessageState) {
        onUpdateMessageState(clientId, 'sent', message.id)
      }

      onMessageSent?.()
    } catch (error) {
      console.error("Error sending message:", error)

      // Update optimistic message to failed state
      if (clientId && onUpdateMessageState) {
        onUpdateMessageState(clientId, 'failed', undefined, "Failed to send")
      }

      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPosition = textarea.selectionStart
    const textBeforeCursor = content.substring(0, cursorPosition)
    const textAfterCursor = content.substring(cursorPosition)

    // Insert emoji at cursor position
    const newContent = textBeforeCursor + emojiData.emoji + textAfterCursor
    setContent(newContent)

    // Close picker
    setShowEmojiPicker(false)

    // Focus textarea and set cursor after emoji
    setTimeout(() => {
      textarea.focus()
      const newCursorPosition = cursorPosition + emojiData.emoji.length
      textarea.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)
  }

  return (
    <div className="border-t relative">
      {/* Reply Preview */}
      {replyToMessage && replyToUsername && onCancelReply && (
        <ReplyPreview
          message={replyToMessage}
          senderName={replyToUsername}
          onCancel={onCancelReply}
        />
      )}

      <div className="p-3">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-20 right-3 z-50"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={350}
              height={400}
            />
          </div>
        )}

        <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] resize-none font-sans"
          style={{ overflow: content.length > 100 ? "auto" : "hidden" }}
          disabled={sending}
        />

        {/* Emoji Button */}
        <Button
          ref={emojiButtonRef}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          variant="ghost"
          size="icon"
          className="h-[60px] w-[60px]"
          type="button"
        >
          <Smile className="h-6 w-6" />
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          <Send className="h-5 w-5" />
        </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
