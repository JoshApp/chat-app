"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/contexts/auth-context"
import { UserAvatar } from "./user-avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import type { Conversation, Message, User } from "@/lib/types/database"

interface ConversationWithDetails extends Conversation {
  other_user: User
  last_message?: Message
}

interface ConversationsListProps {
  onConversationClick: (conversation: ConversationWithDetails) => void
}

export function ConversationsList({ onConversationClick }: ConversationsListProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    console.log("ConversationsList: user =", user)
    if (!user) {
      console.log("ConversationsList: No user, setting loading false")
      setLoading(false)
      return
    }

    const fetchConversations = async () => {
      console.log("ConversationsList: Fetching conversations for user", user.id)
      // Get all conversations for current user
      const { data: convos, error: convosError } = await supabase
        .from("conversations")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("updated_at", { ascending: false })

      if (convosError) {
        console.error("Error fetching conversations:", convosError)
        setLoading(false)
        return
      }

      console.log("ConversationsList: Found", convos?.length || 0, "conversations")
      if (!convos || convos.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      // Get other user IDs
      const otherUserIds = convos.map((c) =>
        c.user1_id === user.id ? c.user2_id : c.user1_id
      )

      // Fetch other users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .in("id", otherUserIds)

      if (usersError) {
        console.error("Error fetching users:", usersError)
        setLoading(false)
        return
      }

      // Fetch last message for each conversation
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .in(
          "conversation_id",
          convos.map((c) => c.id)
        )
        .order("created_at", { ascending: false })

      if (messagesError) {
        console.error("Error fetching messages:", messagesError)
      }

      // Combine data
      const conversationsWithDetails: ConversationWithDetails[] = convos.map((convo) => {
        const otherUserId = convo.user1_id === user.id ? convo.user2_id : convo.user1_id
        const otherUser = users?.find((u) => u.id === otherUserId)
        const lastMessage = messages?.find((m) => m.conversation_id === convo.id)

        return {
          ...convo,
          other_user: otherUser!,
          last_message: lastMessage,
        }
      })

      setConversations(conversationsWithDetails)
      setLoading(false)
    }

    fetchConversations()

    // Subscribe to conversation updates
    const channel = supabase
      .channel("conversations-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `or(user1_id.eq.${user.id},user2_id.eq.${user.id})`,
        },
        () => {
          fetchConversations()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start chatting with someone from the Online tab!
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onConversationClick(conversation)}
            className="w-full flex items-center gap-3 p-4 hover:bg-accent transition-colors"
          >
            <UserAvatar username={conversation.other_user.username} size="md" />
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium truncate">{conversation.other_user.username}</div>
              {conversation.last_message ? (
                <div className="text-sm text-muted-foreground truncate">
                  {conversation.last_message.content}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No messages yet</div>
              )}
            </div>
            {conversation.last_message && (
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                  addSuffix: true,
                })}
              </div>
            )}
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
