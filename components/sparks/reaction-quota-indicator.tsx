"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SparkQuota } from "@/lib/hooks/use-sparks"

interface ReactionQuotaIndicatorProps {
  quota: SparkQuota
  className?: string
  compact?: boolean
}

export function ReactionQuotaIndicator({
  quota,
  className,
  compact = false,
}: ReactionQuotaIndicatorProps) {
  if (quota.isPremium) {
    return (
      <Badge
        variant="secondary"
        className={cn("bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", className)}
      >
        <Crown className="w-3 h-3 mr-1" />
        Unlimited Sparks
      </Badge>
    )
  }

  const percentage = (quota.remaining / quota.limit) * 100
  const isLow = quota.remaining <= 1

  if (compact) {
    return (
      <Badge
        variant={isLow ? "destructive" : "secondary"}
        className={className}
      >
        <Zap className="w-3 h-3 mr-1" />
        {quota.remaining}/{quota.limit}
      </Badge>
    )
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={cn("w-4 h-4", isLow && "text-destructive")} />
            <span className="text-sm font-medium">Daily Sparks</span>
          </div>
          <span className={cn("text-sm font-semibold", isLow && "text-destructive")}>
            {quota.remaining}/{quota.limit}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all",
              isLow ? "bg-destructive" : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {isLow && (
          <p className="text-xs text-muted-foreground">
            Running low! Upgrade to premium for unlimited sparks.
          </p>
        )}
      </div>
    </Card>
  )
}
