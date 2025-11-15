"use client"

import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  count: number
  className?: string
  pulse?: boolean
}

export function NotificationBadge({ count, className, pulse = false }: NotificationBadgeProps) {
  if (count === 0) return null

  const displayCount = count > 99 ? "99+" : count.toString()

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center",
        "bg-red-500 text-white text-xs font-bold rounded-full",
        "ring-2 ring-background",
        pulse && "animate-pulse",
        className
      )}
    >
      {displayCount}
    </div>
  )
}
