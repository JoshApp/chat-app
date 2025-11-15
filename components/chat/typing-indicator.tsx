"use client"

import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  username?: string
  className?: string
}

export function TypingIndicator({ username, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      {username && <span className="font-medium">{username} is typing</span>}
      {!username && <span>typing</span>}
      <div className="flex items-center gap-0.5">
        <span
          className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
        />
        <span
          className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
        />
        <span
          className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
        />
      </div>
    </div>
  )
}
