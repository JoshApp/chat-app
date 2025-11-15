"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/contexts/auth-context"
import { useNotifications } from "@/lib/contexts/notification-context"
import { useTypingPresence } from "@/lib/hooks/use-typing-presence"
import { MessageBubble, type MessageGroupPosition } from "./message-bubble"
import { MessageInput } from "./message-input"
import { type MessageReaction } from "./message-reactions"
import { TypingIndicator } from "./typing-indicator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "./user-avatar"
import { UsernameWithFlag } from "./username-with-flag"
import { MoreVertical } from "lucide-react"
import type { Message, MessageWithSendState } from "@/lib/types/database"
import { format, isToday, isYesterday, isSameDay } from "date-fns"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

function getGenderSymbol(gender: string): { symbol: string; color: string } | null {
  switch (gender.toLowerCase()) {
    case "female":
    case "woman":
      return { symbol: "♀", color: "text-pink-400" }
    case "male":
    case "man":
      return { symbol: "♂", color: "text-blue-400" }
    case "prefer_not_to_say":
      return { symbol: "⚧", color: "text-purple-400" }
    default:
      return null
  }
}

// Helper to determine message group position
function getMessageGroupPosition(
  messages: Message[],
  currentIndex: number,
  currentUserId: string
): MessageGroupPosition {
  const current = messages[currentIndex]
  const prev = currentIndex > 0 ? messages[currentIndex - 1] : null
  const next = currentIndex < messages.length - 1 ? messages[currentIndex + 1] : null

  const isSameSenderAsPrev = prev && prev.sender_id === current.sender_id
  const isSameSenderAsNext = next && next.sender_id === current.sender_id

  // Check time gap (group if within 5 minutes)
  const TIME_GAP_MS = 5 * 60 * 1000
  const hasTimeGapFromPrev = prev
    ? new Date(current.created_at).getTime() - new Date(prev.created_at).getTime() > TIME_GAP_MS
    : true
  const hasTimeGapToNext = next
    ? new Date(next.created_at).getTime() - new Date(current.created_at).getTime() > TIME_GAP_MS
    : true

  const isGroupedWithPrev = isSameSenderAsPrev && !hasTimeGapFromPrev
  const isGroupedWithNext = isSameSenderAsNext && !hasTimeGapToNext

  if (isGroupedWithPrev && isGroupedWithNext) return "middle"
  if (isGroupedWithPrev) return "last"
  if (isGroupedWithNext) return "first"
  return "single"
}

// Helper to get day separator label
function getDaySeparatorLabel(date: Date): string {
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "MMMM d, yyyy")
}

// Helper to check if we need a day separator
function needsDaySeparator(messages: Message[], currentIndex: number): string | null {
  const current = messages[currentIndex]
  const prev = currentIndex > 0 ? messages[currentIndex - 1] : null

  if (!prev) {
    // First message always gets a separator
    return getDaySeparatorLabel(new Date(current.created_at))
  }

  const currentDate = new Date(current.created_at)
  const prevDate = new Date(prev.created_at)

  if (!isSameDay(currentDate, prevDate)) {
    return getDaySeparatorLabel(currentDate)
  }

  return null
}

interface ChatViewProps {
  conversationId: string
  otherUser: {
    id: string
    username: string
    age: number
    gender: string
    country_code: string | null
    show_country_flag: boolean
  }
  onBack?: () => void
}

export function ChatView({ conversationId, otherUser, onBack }: ChatViewProps) {
  const { user } = useAuth()
  const { markConversationAsRead, unreadCounts } = useNotifications()
  const [messages, setMessages] = useState<MessageWithSendState[]>([])
  const [reactions, setReactions] = useState<Map<string, MessageReaction[]>>(new Map())
  const reactionsRef = useRef(reactions)
  const [loading, setLoading] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [newMessagesCount, setNewMessagesCount] = useState(0)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const supabase = createClient()

  // Use shared typing presence hook (single channel for both ChatView and MessageInput)
  const { otherUserTyping, setTyping } = useTypingPresence(conversationId, user?.id)

  const unreadCount = unreadCounts.get(conversationId) || 0

  // Keep reactionsRef in sync with reactions state
  useEffect(() => {
    reactionsRef.current = reactions
  }, [reactions])

  // Fetch messages
  useEffect(() => {
    if (!conversationId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
      } else {
        setMessages(data || [])
      }
      setLoading(false)
    }

    fetchMessages()
  }, [conversationId])

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (!conversationId) return

    // Mark conversation as read
    markConversationAsRead(conversationId)
  }, [conversationId, markConversationAsRead])

  // Subscribe to new messages and message updates
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message

          setMessages((prev) => {
            // Check if this is our optimistic message by matching content and sender
            // (optimistic messages have clientId and might be in any send state)
            const optimisticIndex = prev.findIndex(
              (m) => m.clientId && m.sender_id === user?.id && m.content === newMessage.content
            )

            if (optimisticIndex !== -1) {
              // Replace optimistic message with server message
              const updated = [...prev]
              updated[optimisticIndex] = { ...newMessage, sendState: 'sent' }
              return updated
            }

            // Check if message already exists (prevent duplicates)
            const existingIndex = prev.findIndex((m) => m.id === newMessage.id)
            if (existingIndex !== -1) {
              return prev // Message already exists, don't add duplicate
            }

            // Otherwise, add new message (from other user or another device)
            return [...prev, { ...newMessage, sendState: 'sent' }]
          })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id
                ? { ...msg, read_at: updatedMessage.read_at }
                : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [conversationId, user?.id])

  // Fetch reactions for all messages
  useEffect(() => {
    if (!conversationId || messages.length === 0) return

    const fetchReactions = async () => {
      const messageIds = messages.map((m) => m.id)

      const { data, error } = await supabase
        .from("message_reactions")
        .select(
          `
          id,
          message_id,
          emoji,
          user_id,
          created_at,
          users:user_id (
            id,
            display_name
          )
        `
        )
        .in("message_id", messageIds)

      if (error) {
        console.error("Error fetching reactions:", error)
        return
      }

      // Group reactions by message_id
      const reactionsMap = new Map<string, MessageReaction[]>()
      data?.forEach((reaction: any) => {
        const messageReactions = reactionsMap.get(reaction.message_id) || []
        messageReactions.push({
          id: reaction.id,
          emoji: reaction.emoji,
          user_id: reaction.user_id,
          users: reaction.users,
        })
        reactionsMap.set(reaction.message_id, messageReactions)
      })

      setReactions(reactionsMap)
    }

    fetchReactions()
  }, [conversationId, messages.length])

  // Subscribe to reaction changes
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`reactions:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        async (payload) => {
          // Debug logging
          console.log('Reaction event:', payload.eventType, 'new:', payload.new, 'old:', payload.old)

          // Get messageId from payload or find it in current reactions
          let messageId = (payload.new as any)?.message_id

          // For DELETE events, payload.old only has {id}, so find the messageId from current state
          if (!messageId && payload.eventType === 'DELETE' && (payload.old as any)?.id) {
            const deletedReactionId = (payload.old as any).id

            // Search through current reactions (use ref to avoid stale closure)
            for (const [msgId, msgReactions] of reactionsRef.current.entries()) {
              if (msgReactions.some((r) => r.id === deletedReactionId)) {
                messageId = msgId
                console.log('Found messageId from current state:', messageId)
                break
              }
            }
          }

          if (!messageId) {
            console.log('No messageId found in payload or current state')
            return
          }

          console.log('Refetching reactions for message:', messageId)

          const { data, error } = await supabase
            .from("message_reactions")
            .select(
              `
              id,
              message_id,
              emoji,
              user_id,
              created_at,
              users:user_id (
                id,
                display_name
              )
            `
            )
            .eq("message_id", messageId)

          if (error) {
            console.error("Error fetching updated reactions:", error)
            return
          }

          console.log('Fetched reactions:', data)

          setReactions((prev) => {
            const newMap = new Map(prev)
            if (data && data.length > 0) {
              console.log('Setting reactions for message:', messageId, data)
              newMap.set(messageId, data as any[])
            } else {
              console.log('Deleting reactions for message:', messageId)
              newMap.delete(messageId)
            }
            return newMap
          })
        }
      )
      .subscribe((status) => {
        console.log('Reactions subscription status:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [conversationId])

  // Handler for toggling reactions
  const handleReactionToggle = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle reaction")
      }
    } catch (error) {
      console.error("Error toggling reaction:", error)
      toast.error("Failed to react to message")
    }
  }

  // Auto-scroll to bottom (only if already at bottom or it's a new conversation load)
  useEffect(() => {
    if (scrollRef.current && !showScrollButton) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, showScrollButton])

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
      setShowScrollButton(false)
      setNewMessagesCount(0)
    }
  }

  // Handle scroll event to show/hide scroll button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100
    setShowScrollButton(!isAtBottom)

    // If we're at bottom, reset new messages count
    if (isAtBottom) {
      setNewMessagesCount(0)
    }
  }

  // Track new messages when not at bottom
  useEffect(() => {
    if (showScrollButton && messages.length > 0) {
      // Increment count for each new message (simplified - in production you'd track last seen)
      setNewMessagesCount((prev) => prev + 1)
    }
  }, [messages.length, showScrollButton])

  // Scroll to a specific message by ID
  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current.get(messageId)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
      // Highlight the message briefly
      messageElement.classList.add("bg-primary/10")
      setTimeout(() => {
        messageElement.classList.remove("bg-primary/10")
      }, 2000)
    }
  }

  // Create a Map of messages for quick lookup (for resolving parent messages)
  const messagesMap = new Map(messages.map((m) => [m.id, m]))

  // Resolve parent message for a reply
  const getParentMessage = (replyToMessageId: string | null): Message | null => {
    if (!replyToMessageId) return null
    return messagesMap.get(replyToMessageId) || null
  }

  // Add optimistic message (called from MessageInput)
  const addOptimisticMessage = (content: string, replyToMessageId?: string) => {
    if (!user) return null

    const clientId = `client_${Date.now()}_${Math.random()}`
    const optimisticMessage: MessageWithSendState = {
      id: clientId,
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
      reply_to_message_id: replyToMessageId || null,
      sendState: 'sending',
      clientId,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    return clientId
  }

  // Update message send state
  const updateMessageState = (
    clientId: string,
    state: 'sent' | 'failed',
    serverId?: string,
    error?: string
  ) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.clientId === clientId) {
          if (state === 'sent' && serverId) {
            // Replace with server message
            return { ...msg, id: serverId, sendState: 'sent', error: undefined }
          }
          return { ...msg, sendState: state, error }
        }
        return msg
      })
    )
  }

  // Retry failed message
  const retryMessage = async (clientId: string) => {
    const message = messages.find((m) => m.clientId === clientId)
    if (!message) return

    // Update to sending state
    setMessages((prev) =>
      prev.map((msg) => (msg.clientId === clientId ? { ...msg, sendState: 'sending', error: undefined } : msg))
    )

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: message.content,
          replyToMessageId: message.reply_to_message_id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const { message: sentMessage } = await response.json()
      updateMessageState(clientId, 'sent', sentMessage.id)
    } catch (error) {
      console.error("Error retrying message:", error)
      updateMessageState(clientId, 'failed', undefined, "Failed to send")
      toast.error("Failed to send message")
    }
  }

  const genderSymbol = getGenderSymbol(otherUser.gender)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
              ←
            </Button>
          )}
          <div className="relative">
            <UserAvatar username={otherUser.username} size="md" />
            {/* Online indicator - green dot on avatar */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-semibold">
              <UsernameWithFlag
                username={otherUser.username}
                countryCode={otherUser.country_code}
                showFlag={otherUser.show_country_flag}
              />
            </div>
            <div className="h-5 flex items-center">
              {otherUserTyping ? (
                <TypingIndicator username={otherUser.username} className="text-sm" />
              ) : (
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  {genderSymbol && (
                    <span className={cn("font-semibold text-base", genderSymbol.color)}>
                      {genderSymbol.symbol}
                    </span>
                  )}
                  <span>
                    {otherUser.age} • {otherUser.gender === "prefer_not_to_say" ? "Prefer not to say" : otherUser.gender}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-4 pt-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Say hi to {otherUser.username}!
              </p>
            </div>
          ) : (
            <div>
              {messages.map((message, index) => {
                const groupPosition = getMessageGroupPosition(messages, index, user?.id || "")
                const daySeparator = needsDaySeparator(messages, index)

                return (
                  <div key={message.id}>
                    {/* Day separator */}
                    {daySeparator && (
                      <div className="flex items-center justify-center my-6">
                        <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground font-medium">
                          {daySeparator}
                        </div>
                      </div>
                    )}

                    {/* Message bubble */}
                    <MessageBubble
                      messageId={message.id}
                      content={message.content}
                      isMine={message.sender_id === user?.id}
                      timestamp={message.created_at}
                      username={message.sender_id !== user?.id ? otherUser.username : undefined}
                      groupPosition={groupPosition}
                      reactions={reactions.get(message.id) || []}
                      currentUserId={user?.id || ""}
                      onReactionToggle={handleReactionToggle}
                      parentMessage={
                        message.reply_to_message_id ? getParentMessage(message.reply_to_message_id) : undefined
                      }
                      parentMessageSenderName={
                        message.reply_to_message_id
                          ? getParentMessage(message.reply_to_message_id)?.sender_id === user?.id
                            ? "You"
                            : otherUser.username
                          : undefined
                      }
                      onReply={() => setReplyToMessage(message)}
                      onScrollToParent={
                        message.reply_to_message_id
                          ? () => scrollToMessage(message.reply_to_message_id!)
                          : undefined
                      }
                      onReport={
                        message.sender_id !== user?.id
                          ? () => {
                              // TODO: Open report dialog
                              toast.error("Report feature coming soon")
                            }
                          : undefined
                      }
                      sendState={message.sendState}
                      onRetry={message.clientId ? () => retryMessage(message.clientId!) : undefined}
                      readAt={message.read_at}
                      ref={(el) => {
                        if (el) {
                          messageRefs.current.set(message.id, el)
                        } else {
                          messageRefs.current.delete(message.id)
                        }
                      }}
                    />
                  </div>
                )
              })}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <span className="text-sm font-medium">
              {unreadCount > 0 ? `${unreadCount} new` : "↓"}
            </span>
          </button>
        )}
      </div>

      {/* Reserved space for inline typing bubble - fixed height to prevent jumping */}
      <div className="h-7 px-4 mb-1 flex items-start">
        {otherUserTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="px-3 py-2 rounded-xl bg-muted">
              <div className="flex items-center gap-0.5">
                <span
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
                />
                <span
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                  style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
                />
                <span
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                  style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput
        conversationId={conversationId}
        replyToMessage={replyToMessage}
        replyToUsername={replyToMessage?.sender_id === user?.id ? "You" : otherUser.username}
        onCancelReply={() => setReplyToMessage(null)}
        onAddOptimisticMessage={addOptimisticMessage}
        onUpdateMessageState={updateMessageState}
        onTypingChange={setTyping}
      />
    </div>
  )
}
