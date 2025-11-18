"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useSparks } from "@/lib/hooks/use-sparks"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SparkReaction } from "@/lib/hooks/use-sparks"
import type { PresenceUser } from "@/lib/hooks/use-presence"
import { SparksCarousel } from "./sparks-carousel"
import { OnlineUsersSection } from "./online-users-section"

interface DiscoverFeedProps {
  onlineUsers: PresenceUser[]
  onUserClick: (user: PresenceUser) => void
  onStartChat: (userId: string) => void
  onIncomingCountChange?: (count: number) => void
}

export function DiscoverFeed({
  onlineUsers,
  onUserClick,
  onStartChat,
  onIncomingCountChange
}: DiscoverFeedProps) {
  const { user } = useAuth()
  const { fetchIncomingSparks, fetchMutualSparks, sparkBack } = useSparks()

  const [mutualSparks, setMutualSparks] = useState<SparkReaction[]>([])
  const [incomingSparks, setIncomingSparks] = useState<SparkReaction[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch sparks data
  useEffect(() => {
    if (!user) return

    const loadSparks = async () => {
      setLoading(true)
      try {
        const [incoming, mutual] = await Promise.all([
          fetchIncomingSparks(),
          fetchMutualSparks(),
        ])

        // Filter out mutual from incoming
        const nonMutualIncoming = incoming.filter(s => !s.isMutual)

        setIncomingSparks(nonMutualIncoming)
        setMutualSparks(mutual)

        // Notify parent of incoming count
        onIncomingCountChange?.(nonMutualIncoming.length)
      } catch (error) {
        console.error("Error loading sparks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSparks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleSparkBack = async (userId: string, emoji: string): Promise<boolean> => {
    const success = await sparkBack(userId, emoji)
    if (success) {
      // Refresh sparks
      const [incoming, mutual] = await Promise.all([
        fetchIncomingSparks(),
        fetchMutualSparks(),
      ])
      const nonMutualIncoming = incoming.filter(s => !s.isMutual)
      setIncomingSparks(nonMutualIncoming)
      setMutualSparks(mutual)
      onIncomingCountChange?.(nonMutualIncoming.length)
    }
    return success
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleIncomingSparkClick = (spark: SparkReaction) => {
    // Convert spark reactor to PresenceUser format and open modal
    if (spark.reactor) {
      const presenceUser: PresenceUser = {
        user_id: spark.reactor.id,
        username: spark.reactor.display_name, // For backward compatibility
        display_name: spark.reactor.display_name,
        age: spark.reactor.age,
        country_code: spark.reactor.country_code,
        show_country_flag: spark.reactor.show_country_flag,
        vibe: spark.reactor.vibe,
        status_line: spark.reactor.status_line,
        interests: spark.reactor.interests,
        premium_tier: spark.reactor.premium_tier,
        online_at: new Date().toISOString(),
      }
      onUserClick(presenceUser)
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Discover
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Find your vibe and make connections</p>
        </div>

        <div className="space-y-3 py-3">
          {/* Sparks Carousel (Horizontal) */}
          <SparksCarousel
            mutualSparks={mutualSparks}
            incomingSparks={incomingSparks}
            onMutualClick={onStartChat}
            onIncomingClick={handleIncomingSparkClick}
          />

          {/* Online Users Section */}
          <OnlineUsersSection
            onlineUsers={onlineUsers}
            onUserClick={onUserClick}
          />
        </div>
      </div>
    </ScrollArea>
  )
}
