"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Smile } from "lucide-react"
import toast from "react-hot-toast"
import dynamic from "next/dynamic"
import type { EmojiClickData } from "emoji-picker-react"

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

interface MessageInputProps {
  conversationId: string
  onMessageSent?: () => void
}

export function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

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

  const handleSend = async () => {
    if (!content.trim() || sending) return

    setSending(true)

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setContent("")
      onMessageSent?.()
    } catch (error) {
      console.error("Error sending message:", error)
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
    <div className="border-t p-4 relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-20 right-4 z-50"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            emojiStyle="twitter"
            theme="dark"
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
          onChange={(e) => setContent(e.target.value)}
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
  )
}
