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
        "group relative overflow-hidden transition-all duration-300 rounded-lg",
        "bg-gradient-to-br from-background to-muted/20",
        !isCurrentUser && "cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/20 hover:border-primary/40 hover:scale-[1.02]",
        isCurrentUser && "opacity-70 cursor-default border-primary/20",
        sparkStatus === "mutual" && "border-primary/50 bg-gradient-to-br from-primary/5 to-background shadow-sm shadow-primary/10",
        sparkStatus === "received" && "border-primary/30",
        className
      )}
      onClick={() => !isCurrentUser && onClick()}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Top section: Avatar + Name/Age horizontal */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <UserAvatar username={user.display_name} size="lg" className="w-16 h-16" />
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <UsernameWithFlag
                username={user.display_name}
                countryCode={user.country_code}
                showFlag={user.show_country_flag}
                className="font-semibold text-base truncate"
              />
              {isPremium && (
                <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">{user.age} years</span>
              {user.vibe && <VibeBadge vibe={user.vibe} size="sm" />}
            </div>
          </div>
        </div>

        {/* Status line */}
        {user.status_line && (
          <p className="text-xs text-muted-foreground italic line-clamp-1 mb-2">
            "{user.status_line}"
          </p>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="mb-auto">
            <InterestTagList tags={user.interests} maxVisible={2} size="sm" />
          </div>
        )}

        {/* Footer: Spark status or current user badge */}
        <div className="mt-3 pt-3 border-t border-border">
          {isCurrentUser ? (
            <Badge variant="outline" className="border-primary/50 text-primary text-xs">
              This is you
            </Badge>
          ) : sparkStatus === "mutual" ? (
            <div className="flex items-center gap-1.5 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Mutual spark</span>
            </div>
          ) : sparkStatus === "received" ? (
            <div className="flex items-center gap-1.5 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Sparked you</span>
            </div>
          ) : sparkStatus === "sent" ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs">Spark sent</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Hover overlay effect */}
      {!isCurrentUser && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </Card>
  )
}
