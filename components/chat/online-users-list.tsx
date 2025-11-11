"use client"

import { UserAvatar } from "./user-avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePresence, type PresenceUser } from "@/lib/hooks/use-presence"
import { useAuth } from "@/lib/contexts/auth-context"

interface OnlineUsersListProps {
  onUserClick: (user: PresenceUser) => void
}

export function OnlineUsersList({ onUserClick }: OnlineUsersListProps) {
  const { onlineUsers } = usePresence()
  const { user } = useAuth()

  if (onlineUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-muted-foreground">No users online right now</p>
        <p className="text-sm text-muted-foreground mt-2">Check back later!</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {onlineUsers.map((onlineUser) => {
          const isCurrentUser = user && onlineUser.user_id === user.id

          return (
            <button
              key={onlineUser.user_id}
              onClick={() => !isCurrentUser && onUserClick(onlineUser)}
              disabled={isCurrentUser}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrentUser
                  ? "opacity-60 cursor-default"
                  : "hover:bg-accent cursor-pointer"
              }`}
            >
              <div className="relative">
                <UserAvatar username={onlineUser.username} size="md" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium flex items-center gap-2">
                  {onlineUser.username}
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {onlineUser.age} • {onlineUser.gender === "prefer_not_to_say" ? "Prefer not to say" : onlineUser.gender}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
