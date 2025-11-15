"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface TypingPresenceState {
  userId: string
  isTyping: boolean
  timestamp?: number
}

export function useTypingPresence(conversationId: string, userId: string | undefined) {
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!conversationId || !userId) return

    console.log('🔗 [useTypingPresence] Creating single shared channel', {
      conversationId,
      userId
    })

    const channel = supabase.channel(`typing:${conversationId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, TypingPresenceState[]>

        console.log('🔄 [useTypingPresence] Presence sync', {
          fullState: state,
          currentUserId: userId
        })

        // Find other user's typing state (not current user)
        const otherUserState = Object.values(state).find(
          (presences) => presences[0]?.userId !== userId
        )

        const isTyping = Boolean(otherUserState?.[0]?.isTyping)

        console.log('👤 [useTypingPresence] Other user typing:', isTyping)

        setOtherUserTyping(isTyping)
      })
      .subscribe(async (status) => {
        console.log('📡 [useTypingPresence] Channel status:', status)

        if (status === 'SUBSCRIBED') {
          // Track initial state as not typing
          await channel.track({ userId, isTyping: false })
          console.log('✅ [useTypingPresence] Initial state tracked')
        }
      })

    channelRef.current = channel

    return () => {
      console.log('🔌 [useTypingPresence] Cleaning up channel')
      if (channelRef.current) {
        channelRef.current.untrack()
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [conversationId, userId])

  // Function to update typing state
  const setTyping = async (isTyping: boolean) => {
    if (!channelRef.current || !userId) return

    console.log('⌨️ [useTypingPresence] Setting typing:', isTyping)

    await channelRef.current.track({
      userId,
      isTyping,
      timestamp: Date.now(),
    })
  }

  return { otherUserTyping, setTyping }
}
