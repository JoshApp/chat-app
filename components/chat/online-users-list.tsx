"use client"

import { UserAvatar } from "./user-avatar"
import { UsernameWithFlag } from "./username-with-flag"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PresenceUser } from "@/lib/hooks/use-presence"
import { useAuth } from "@/lib/contexts/auth-context"
import { cn } from "@/lib/utils"

interface OnlineUsersListProps {
  onlineUsers: PresenceUser[]
  onUserClick: (user: PresenceUser) => void
}

function getGenderBackgroundClass(gender: string | undefined): string {
  if (!gender) return "bg-purple-500/10"

  switch (gender.toLowerCase()) {
    case "female":
    case "woman":
      return "bg-pink-500/10"
    case "male":
    case "man":
      return "bg-blue-500/10"
    default:
      return "bg-purple-500/10"
  }
}

function getGenderSymbol(gender: string | undefined): { symbol: string; color: string } | null {
  if (!gender) return null

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

export function OnlineUsersList({ onlineUsers, onUserClick }: OnlineUsersListProps) {
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
              disabled={!!isCurrentUser}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                "bg-secondary/50 hover:bg-secondary",
                isCurrentUser
                  ? "opacity-60 cursor-default"
                  : "cursor-pointer"
              )}
            >
              <div className="relative">
                <UserAvatar username={onlineUser.display_name} size="md" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium flex items-center gap-2">
                  <UsernameWithFlag
                    username={onlineUser.display_name}
                    countryCode={onlineUser.country_code}
                    showFlag={onlineUser.show_country_flag}
                  />
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span>{onlineUser.age} years old</span>
                  {onlineUser.vibe && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{onlineUser.vibe}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
