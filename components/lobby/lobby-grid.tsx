"use client"

import { useState, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserProfileCard } from "./user-profile-card"
import { LobbyFilters, type LobbyFilterState } from "./lobby-filters"
import type { PresenceUser } from "@/lib/hooks/use-presence"
import { useAuth } from "@/lib/contexts/auth-context"
import { Users } from "lucide-react"

interface LobbyGridProps {
  onlineUsers: PresenceUser[]
  onUserClick: (user: PresenceUser) => void
}

export function LobbyGrid({ onlineUsers, onUserClick }: LobbyGridProps) {
  const { user } = useAuth()

  const [filters, setFilters] = useState<LobbyFilterState>({
    vibe: "all",
    interests: [],
    minAge: 18,
    maxAge: 100,
  })

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

  const currentUserData = onlineUsers.find((u) => u.user_id === user?.id)

  if (onlineUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No one online right now</p>
        <p className="text-sm text-muted-foreground mt-2">
          Check back later to find your vibe!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with user count */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {filteredUsers.length} {filteredUsers.length === 1 ? "person is" : "people are"} here right now
            </h2>
            {filteredUsers.length !== onlineUsers.length && (
              <p className="text-sm text-muted-foreground">
                {onlineUsers.length} total
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b">
        <LobbyFilters
          filters={filters}
          onFiltersChange={setFilters}
          collapsible={true}
        />
      </div>

      {/* User grid */}
      <ScrollArea className="flex-1">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground">No users match your filters</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((onlineUser) => {
              const isCurrentUser = user && onlineUser.user_id === user.id

              return (
                <UserProfileCard
                  key={onlineUser.user_id}
                  user={onlineUser}
                  onClick={() => onUserClick(onlineUser)}
                  isCurrentUser={!!isCurrentUser}
                />
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
