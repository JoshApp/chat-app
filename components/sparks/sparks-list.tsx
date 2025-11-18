"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/chat/user-avatar"
import { UsernameWithFlag } from "@/components/chat/username-with-flag"
import { VibeBadge } from "@/components/vibe"
import { InterestTagList } from "@/components/interest-tags"
import { SparkBackButton } from "./spark-back-button"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Clock, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SparkReaction } from "@/lib/hooks/use-sparks"

interface SparksListProps {
  sparks: SparkReaction[]
  type: "incoming" | "sent" | "mutual"
  onSparkBack?: (userId: string, emoji: string) => Promise<boolean>
  onStartChat?: (userId: string) => void
  onUndo?: (userId: string) => Promise<boolean>
  className?: string
}

export function SparksList({
  sparks,
  type,
  onSparkBack,
  onStartChat,
  onUndo,
  className,
}: SparksListProps) {
  if (sparks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-lg text-muted-foreground mb-2">
          {type === "incoming" && "No sparks yet"}
          {type === "sent" && "You haven't sparked anyone yet"}
          {type === "mutual" && "No mutual chemistry yet"}
        </p>
        <p className="text-sm text-muted-foreground">
          {type === "incoming" && "When someone feels a vibe, they'll show up here"}
          {type === "sent" && "Head to the lobby and spark someone who catches your eye"}
          {type === "mutual" && "When you both feel it, you'll see them here"}
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {sparks.map((spark) => {
        // Determine which user data to display
        const displayUser = type === "sent" ? spark.target : type === "mutual" ? spark.target : spark.reactor
        if (!displayUser) return null

        const isPremium = displayUser.premium_tier === "premium"

        return (
          <Card
            key={spark.id}
            className={cn(
              "p-4",
              type === "mutual" && "cursor-pointer hover:bg-accent/50 transition-colors"
            )}
            onClick={() => {
              if (type === "mutual" && onStartChat) {
                onStartChat(displayUser.id)
              }
            }}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <UserAvatar username={displayUser.display_name} size="md" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <UsernameWithFlag
                    username={displayUser.display_name}
                    countryCode={displayUser.country_code}
                    showFlag={displayUser.show_country_flag}
                    className="font-semibold truncate"
                  />
                  {isPremium && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">
                    {displayUser.age} years old
                  </span>
                  {displayUser.vibe && <VibeBadge vibe={displayUser.vibe} size="sm" />}
                </div>

                {/* Status line */}
                {displayUser.status_line && (
                  <p className="text-sm text-muted-foreground italic mb-2 line-clamp-1">
                    "{displayUser.status_line}"
                  </p>
                )}

                {/* Interests */}
                {displayUser.interests && displayUser.interests.length > 0 && (
                  <div className="mb-3">
                    <InterestTagList tags={displayUser.interests} maxVisible={3} size="sm" />
                  </div>
                )}

                {/* Spark Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{spark.emoji}</span>
                    <div className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDistanceToNow(new Date(spark.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {spark.isMutual && (
                    <Badge variant="default" className="bg-primary/20 text-primary border-primary/50">
                      💫 Mutual
                    </Badge>
                  )}
                  {type === "sent" && !spark.isMutual && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Waiting...
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {type === "incoming" && !spark.isMutual && onSparkBack && (
                    <SparkBackButton
                      targetUserId={displayUser.id}
                      onSparkBack={(emoji) => onSparkBack(displayUser.id, emoji)}
                      className="flex-1"
                    />
                  )}

                  {type === "incoming" && spark.isMutual && onStartChat && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onStartChat(displayUser.id)}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Open chat
                    </Button>
                  )}

                  {type === "mutual" && onStartChat && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span>Click anywhere to open chat</span>
                    </div>
                  )}

                  {type === "sent" && !spark.isMutual && onUndo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUndo(displayUser.id)}
                    >
                      Take it back
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
