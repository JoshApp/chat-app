import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Vibe } from "@/lib/types/database"

interface VibeBadgeProps {
  vibe: Vibe | null
  size?: "sm" | "md" | "lg"
  className?: string
  showIcon?: boolean
  showLabel?: boolean
}

const vibeConfig = {
  soft: {
    label: "Soft",
    icon: "💙",
    color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  },
  flirty: {
    label: "Flirty",
    icon: "💛",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
  },
  spicy: {
    label: "Spicy",
    icon: "💜",
    color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
  },
  intense: {
    label: "Intense",
    icon: "🔥",
    color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  },
}

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-1",
  lg: "text-base px-3 py-1.5",
}

export function VibeBadge({
  vibe,
  size = "md",
  className,
  showIcon = true,
  showLabel = true,
}: VibeBadgeProps) {
  if (!vibe) return null

  const config = vibeConfig[vibe]

  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        sizeClasses[size],
        "font-medium",
        className
      )}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {showLabel && config.label}
    </Badge>
  )
}

// Helper to get vibe description
export function getVibeDescription(vibe: Vibe): string {
  const descriptions = {
    soft: "Gentle, emotional, slow-building",
    flirty: "Playful, teasing, fun energy",
    spicy: "Intense flirting, explicit OK",
    intense: "Raw, direct, no limits",
  }
  return descriptions[vibe]
}

// Helper to get vibe color (for use in other components)
export function getVibeColor(vibe: Vibe): string {
  const colors = {
    soft: "text-blue-600 dark:text-blue-400",
    flirty: "text-yellow-600 dark:text-yellow-400",
    spicy: "text-purple-600 dark:text-purple-400",
    intense: "text-red-600 dark:text-red-400",
  }
  return colors[vibe]
}
