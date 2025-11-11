"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/contexts/auth-context"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface PresenceUser {
  user_id: string
  username: string
  gender: string
  age: number
  online_at: string
}

export function usePresence() {
  const { user } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Create presence channel
    const presenceChannel = supabase.channel("online-users", {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    // Track current user's presence
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState()
        const usersMap = new Map<string, PresenceUser>()

        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[]
          presences.forEach((presence) => {
            // Deduplicate by user_id - only keep one entry per user
            if (!usersMap.has(presence.user_id)) {
              usersMap.set(presence.user_id, presence)
            }
          })
        })

        setOnlineUsers(Array.from(usersMap.values()))
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track this user's presence
          await presenceChannel.track({
            user_id: user.id,
            username: user.username,
            gender: user.gender,
            age: user.age,
            online_at: new Date().toISOString(),
          })
        }
      })

    setChannel(presenceChannel)

    // Cleanup on unmount
    return () => {
      presenceChannel.untrack()
      presenceChannel.unsubscribe()
    }
  }, [user])

  return { onlineUsers, channel }
}
