"use client"

import { Card } from "@/components/ui/card"
import { UserAvatar } from "@/components/chat/user-avatar"
import { UsernameWithFlag } from "@/components/chat/username-with-flag"
import { VibeBadge } from "@/components/vibe"
import { InterestTagList } from "@/components/interest-tags"
import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SparkReaction } from "@/lib/hooks/use-sparks"

interface MutualSparksSectionProps {
  sparks: SparkReaction[]
  onStartChat: (userId: string) => void
}

export function MutualSparksSection({ sparks, onStartChat }: MutualSparksSectionProps) {
  return (
    <div>
      <div className="mb-4 pb-3 border-b border-primary/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">💫</span>
          </div>
          <h3 className="text-lg font-bold">Mutual Sparks</h3>
        </div>
        <p className="text-sm text-muted-foreground pl-10">You both feel the chemistry</p>
      </div>

      <div className="space-y-3">
        {sparks.map((spark) => {
          const displayUser = spark.target
          if (!displayUser) return null

          const isPremium = displayUser.premium_tier === "premium"

          return (
            <Card
              key={spark.id}
              className={cn(
                "p-4 cursor-pointer transition-all",
                "bg-gradient-to-br from-primary/5 to-transparent",
                "border-primary/30 hover:border-primary/50",
                "hover:shadow-md"
              )}
              onClick={() => onStartChat(displayUser.id)}
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
                      <InterestTagList tags={displayUser.interests} maxVisible={4} size="sm" />
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-2xl">{spark.emoji}</span>
                    <span>Click anywhere to open chat</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
