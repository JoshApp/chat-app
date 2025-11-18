"use client"

import { UserAvatar } from "@/components/chat/user-avatar"
import { UsernameWithFlag } from "@/components/chat/username-with-flag"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Sparkles, Crown } from "lucide-react"
import type { SparkReaction } from "@/lib/hooks/use-sparks"
import { cn } from "@/lib/utils"

interface SparksCarouselProps {
  mutualSparks: SparkReaction[]
  incomingSparks: SparkReaction[]
  onMutualClick: (userId: string) => void
  onIncomingClick: (spark: SparkReaction) => void
}

export function SparksCarousel({
  mutualSparks,
  incomingSparks,
  onMutualClick,
  onIncomingClick,
}: SparksCarouselProps) {
  const totalSparks = mutualSparks.length + incomingSparks.length

  if (totalSparks === 0) return null

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3 px-4 pb-2 border-b border-primary/20">
        <span className="text-base">🔥</span>
        <h3 className="text-sm font-semibold">
          {mutualSparks.length > 0 && incomingSparks.length > 0
            ? "Sparks"
            : mutualSparks.length > 0
            ? "Mutual Sparks"
            : "Incoming Sparks"}
        </h3>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
          {totalSparks}
        </Badge>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 px-4 pb-2">
          {/* Mutual sparks first (priority) */}
          {mutualSparks.map((spark) => {
            const user = spark.target
            if (!user) return null
            const isPremium = user.premium_tier === "premium"

            return (
              <Card
                key={spark.id}
                onClick={() => onMutualClick(user.id)}
                className={cn(
                  "relative flex-shrink-0 w-24 p-3 cursor-pointer transition-all",
                  "bg-gradient-to-br from-primary/5 to-transparent",
                  "border-primary/30 hover:border-primary/50 hover:shadow-md"
                )}
              >
                {/* Mutual badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                  <span className="text-xs">💫</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <UserAvatar username={user.display_name} size="md" className="w-14 h-14" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  </div>
                  <div className="text-center w-full">
                    <div className="flex items-center justify-center gap-0.5">
                      <p className="text-xs font-medium truncate max-w-[70px]">{user.display_name}</p>
                      {isPremium && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{user.age}</p>
                  </div>
                </div>
              </Card>
            )
          })}

          {/* Incoming sparks */}
          {incomingSparks.map((spark) => {
            const user = spark.reactor
            if (!user) return null
            const isPremium = user.premium_tier === "premium"

            return (
              <Card
                key={spark.id}
                onClick={() => onIncomingClick(spark)}
                className={cn(
                  "relative flex-shrink-0 w-24 p-3 cursor-pointer transition-all",
                  "border-primary/20 hover:border-primary/40 hover:shadow-md"
                )}
              >
                {/* Incoming badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center border-2 border-background">
                  <span className="text-xs">✨</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <UserAvatar username={user.display_name} size="md" className="w-14 h-14" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  </div>
                  <div className="text-center w-full">
                    <div className="flex items-center justify-center gap-0.5">
                      <p className="text-xs font-medium truncate max-w-[70px]">{user.display_name}</p>
                      {isPremium && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{user.age}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
