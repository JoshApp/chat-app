"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/chat/user-avatar"
import { UsernameWithFlag } from "@/components/chat/username-with-flag"
import { VibeBadge } from "@/components/vibe"
import { InterestTagList } from "@/components/interest-tags"
import type { PresenceUser } from "@/lib/hooks/use-presence"
import { cn } from "@/lib/utils"
import { Crown, Sparkles } from "lucide-react"

interface UserProfileCardProps {
  user: PresenceUser
  onClick: () => void
  isCurrentUser?: boolean
  sparkStatus?: "sent" | "received" | "mutual" | null
  className?: string
}

export function UserProfileCard({
  user,
  onClick,
  isCurrentUser = false,
  sparkStatus = null,
  className,
}: UserProfileCardProps) {
  const isPremium = user.premium_tier === "premium"

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        "bg-gradient-to-br from-background to-muted/20",
        !isCurrentUser && "cursor-pointer hover:shadow-lg hover:border-primary/40 hover:-translate-y-1",
        isCurrentUser && "opacity-70 cursor-default border-primary/20",
        sparkStatus === "mutual" && "border-primary/50 bg-gradient-to-br from-primary/5 to-background",
        sparkStatus === "received" && "border-primary/30",
        className
      )}
      onClick={() => !isCurrentUser && onClick()}
    >
      {/* Spark Status Badge (Top Right) */}
      {sparkStatus && (
        <div className="absolute top-3 right-3 z-10">
          {sparkStatus === "mutual" && (
            <Badge className="bg-primary/20 text-primary border-primary/50 gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Mutual</span>
            </Badge>
          )}
          {sparkStatus === "received" && (
            <Badge variant="outline" className="border-primary/50 text-primary gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Sparked you</span>
            </Badge>
          )}
          {sparkStatus === "sent" && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              <span>You sparked</span>
            </Badge>
          )}
        </div>
      )}

      <div className="p-4 space-y-2">
        {/* Line 1: Avatar + Name/Age inline */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <UserAvatar username={user.display_name} size="md" className="w-12 h-12" />
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <UsernameWithFlag
                username={user.display_name}
                countryCode={user.country_code}
                showFlag={user.show_country_flag}
                className="font-semibold text-base truncate"
              />
              {isPremium && (
                <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.age} years old</p>
          </div>
        </div>

        {/* Line 2: Vibe + Interests inline */}
        <div className="flex items-center gap-2 flex-wrap">
          {user.vibe && <VibeBadge vibe={user.vibe} size="sm" />}
          {user.interests && user.interests.length > 0 && (
            <InterestTagList tags={user.interests} maxVisible={3} size="sm" />
          )}
        </div>

        {/* Line 3: Status line (optional) */}
        {user.status_line && (
          <p className="text-xs text-muted-foreground italic line-clamp-1">
            "{user.status_line}"
          </p>
        )}

        {/* Current User Badge */}
        {isCurrentUser && (
          <Badge variant="outline" className="border-primary/50 text-primary text-xs">
            This is you
          </Badge>
        )}
      </div>

      {/* Hover overlay effect */}
      {!isCurrentUser && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </Card>
  )
}
