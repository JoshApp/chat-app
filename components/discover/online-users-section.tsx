"use client"

import { useState, useMemo, useEffect } from "react"
import { UserProfileCard } from "@/components/lobby/user-profile-card"
import { LobbyFilters, type LobbyFilterState } from "@/components/lobby/lobby-filters"
import type { PresenceUser } from "@/lib/hooks/use-presence"
import { useAuth } from "@/lib/contexts/auth-context"
import { useSparks } from "@/lib/hooks/use-sparks"
import { Users } from "lucide-react"

interface OnlineUsersSectionProps {
  onlineUsers: PresenceUser[]
  onUserClick: (user: PresenceUser) => void
}

type SparkStatusMap = Map<string, "sent" | "received" | "mutual">

export function OnlineUsersSection({ onlineUsers, onUserClick }: OnlineUsersSectionProps) {
  const { user } = useAuth()
  const { fetchIncomingSparks, fetchSentSparks, fetchMutualSparks } = useSparks()

  const [sparkStatus, setSparkStatus] = useState<SparkStatusMap>(new Map())
  const [filters, setFilters] = useState<LobbyFilterState>({
    vibe: "all",
    interests: [],
    minAge: 18,
    maxAge: 100,
  })

  // Fetch spark statuses for all online users
  useEffect(() => {
    if (!user) return

    const loadSparkStatuses = async () => {
      try {
        const [incoming, sent, mutual] = await Promise.all([
          fetchIncomingSparks(),
          fetchSentSparks(),
          fetchMutualSparks(),
        ])

        const statusMap = new Map<string, "sent" | "received" | "mutual">()

        // Mutual sparks have highest priority
        mutual.forEach((spark) => {
          const targetId = spark.target?.id || spark.reactor?.id
          if (targetId) statusMap.set(targetId, "mutual")
        })

        // Incoming sparks (they sparked you)
        incoming.forEach((spark) => {
          const reactorId = spark.reactor?.id
          if (reactorId && !statusMap.has(reactorId)) {
            statusMap.set(reactorId, "received")
          }
        })

        // Sent sparks (you sparked them)
        sent.forEach((spark) => {
          const targetId = spark.target?.id
          if (targetId && !statusMap.has(targetId)) {
            statusMap.set(targetId, "sent")
          }
        })

        setSparkStatus(statusMap)
      } catch (error) {
        console.error("Error loading spark statuses:", error)
      }
    }

    loadSparkStatuses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Filter users based on current filters
  const filteredUsers = useMemo(() => {
    return onlineUsers.filter((onlineUser) => {
      // Filter by vibe
      if (filters.vibe !== "all" && onlineUser.vibe !== filters.vibe) {
        return false
      }

      // Filter by interests (user must have at least one matching interest)
      if (filters.interests.length > 0) {
        const hasMatchingInterest = filters.interests.some((filterInterest) =>
          onlineUser.interests?.includes(filterInterest)
        )
        if (!hasMatchingInterest) return false
      }

      // Filter by age range
      if (onlineUser.age < filters.minAge || onlineUser.age > filters.maxAge) {
        return false
      }

      return true
    })
  }, [onlineUsers, filters])

  if (onlineUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Users className="w-8 h-8 text-primary/60" />
        </div>
        <p className="text-lg font-semibold mb-1">No one's here right now</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          The vibe room is empty at the moment. Check back soon - someone interesting might just show up
        </p>
      </div>
    )
  }

  return (
    <div className="px-4">
      <div className="mb-3 pb-2 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Everyone online</h3>
          <span className="text-xs text-muted-foreground">
            {filteredUsers.length} {filteredUsers.length === 1 ? "person" : "people"}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-3">
        <LobbyFilters
          filters={filters}
          onFiltersChange={setFilters}
          collapsible={true}
        />
      </div>

      {/* User grid */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-base font-medium mb-1">No matches for those filters</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Try broadening your search - your perfect vibe might be just outside these settings
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredUsers.map((onlineUser) => {
            const isCurrentUser = user && onlineUser.user_id === user.id

            return (
              <UserProfileCard
                key={onlineUser.user_id}
                user={onlineUser}
                onClick={() => onUserClick(onlineUser)}
                isCurrentUser={!!isCurrentUser}
                sparkStatus={sparkStatus.get(onlineUser.user_id) || null}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
