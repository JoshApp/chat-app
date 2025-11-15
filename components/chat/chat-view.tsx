"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/contexts/auth-context"
import { useNotifications } from "@/lib/contexts/notification-context"
import { MessageBubble, type MessageGroupPosition } from "./message-bubble"
import { MessageInput } from "./message-input"
import { type MessageReaction } from "./message-reactions"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "./user-avatar"
import { UsernameWithFlag } from "./username-with-flag"
import { MoreVertical } from "lucide-react"
import type { Message } from "@/lib/types/database"
import { format, isToday, isYesterday, isSameDay } from "date-fns"
import toast from "react-hot-toast"

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
  const [messages, setMessages] = useState<Message[]>([])
  const [reactions, setReactions] = useState<Map<string, MessageReaction[]>>(new Map())
  const reactionsRef = useRef(reactions)
  const [loading, setLoading] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [newMessagesCount, setNewMessagesCount] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

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

  // Subscribe to new messages
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
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [conversationId])

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
          <UserAvatar username={otherUser.username} size="md" />
          <div>
            <div className="font-semibold">
              <UsernameWithFlag
                username={otherUser.username}
                countryCode={otherUser.country_code}
                showFlag={otherUser.show_country_flag}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {otherUser.age} • {otherUser.gender === "prefer_not_to_say" ? "Prefer not to say" : otherUser.gender}
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
          className="h-full overflow-y-auto p-4"
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

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  )
}
