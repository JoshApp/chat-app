"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/contexts/auth-context"
import { useNotificationSound } from "@/lib/hooks/use-notification-sound"
import type { Message } from "@/lib/types/database"

interface UnreadCount {
  conversationId: string
  count: number
}

type NotificationContextType = {
  unreadCounts: Map<string, number>
  totalUnread: number
  markConversationAsRead: (conversationId: string) => Promise<void>
  refreshUnreadCounts: () => Promise<void>
  isMuted: boolean
  toggleMute: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { play, isMuted, toggleMute } = useNotificationSound()
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map())
  const supabase = useMemo(() => createClient(), [])

  // Calculate total unread count
  const totalUnread = useMemo(() => {
    return Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0)
  }, [unreadCounts])

  // Fetch unread counts for all conversations
  const refreshUnreadCounts = useCallback(async () => {
    if (!user) return

    try {
      // Get all conversations for the current user
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

      if (convError || !conversations) return

      // For each conversation, count unread messages
      const counts = new Map<string, number>()

      await Promise.all(
        conversations.map(async (conv) => {
          const { count, error } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", user.id) // Not sent by me
            .is("read_at", null) // Not read yet

          if (!error && count !== null) {
            counts.set(conv.id, count)
          }
        })
      )

      setUnreadCounts(counts)
    } catch (error) {
      console.error("Error fetching unread counts:", error)
    }
  }, [user, supabase])

  // Mark all messages in a conversation as read
  const markConversationAsRead = useCallback(
    async (conversationId: string) => {
      if (!user) return

      try {
        const response = await fetch("/api/messages/mark-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        })

        if (response.ok) {
          // Update local state
          setUnreadCounts((prev) => {
            const newCounts = new Map(prev)
            newCounts.set(conversationId, 0)
            return newCounts
          })
        }
      } catch (error) {
        console.error("Error marking messages as read:", error)
      }
    },
    [user]
  )

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return

    // Initial fetch
    refreshUnreadCounts()

    // Subscribe to new messages
    const channel = supabase
      .channel("notification-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message

          // Only notify for messages not sent by current user
          if (newMessage.sender_id !== user.id) {
            // Play notification sound
            play()

            // Increment unread count for this conversation
            setUnreadCounts((prev) => {
              const newCounts = new Map(prev)
              const currentCount = newCounts.get(newMessage.conversation_id) || 0
              newCounts.set(newMessage.conversation_id, currentCount + 1)
              return newCounts
            })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, supabase, play, refreshUnreadCounts])

  return (
    <NotificationContext.Provider
      value={{
        unreadCounts,
        totalUnread,
        markConversationAsRead,
        refreshUnreadCounts,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
