"use client"

import { TwemojiText } from "@/components/ui/twemoji-text"
import { cn } from "@/lib/utils"

export interface MessageReaction {
  id: string
  emoji: string
  user_id: string
  users: {
    id: string
    display_name: string
  }
}

interface MessageReactionsProps {
  reactions: MessageReaction[]
  currentUserId: string
  onReactionClick: (emoji: string) => void
  className?: string
}

interface GroupedReaction {
  emoji: string
  count: number
  usernames: string[]
  hasCurrentUser: boolean
}

export function MessageReactions({
  reactions,
  currentUserId,
  onReactionClick,
  className,
}: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) {
    return null
  }

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const existing = acc.find((r) => r.emoji === reaction.emoji)
    if (existing) {
      existing.count++
      existing.usernames.push(reaction.users.display_name)
      if (reaction.user_id === currentUserId) {
        existing.hasCurrentUser = true
      }
    } else {
      acc.push({
        emoji: reaction.emoji,
        count: 1,
        usernames: [reaction.users.display_name],
        hasCurrentUser: reaction.user_id === currentUserId,
      })
    }
    return acc
  }, [] as GroupedReaction[])

  return (
    <div className={cn("flex flex-wrap gap-1 mt-1", className)}>
      {groupedReactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={(e) => {
            e.stopPropagation()
            onReactionClick(reaction.emoji)
          }}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all group",
            "border",
            reaction.hasCurrentUser
              ? "bg-primary/10 border-primary/30 hover:bg-destructive/10 hover:border-destructive hover:scale-105 cursor-pointer"
              : "bg-muted/50 border-border/50 hover:bg-accent"
          )}
          title={
            reaction.hasCurrentUser
              ? `${reaction.usernames.join(", ")} (click to remove)`
              : reaction.usernames.join(", ")
          }
        >
          <span className="text-sm leading-none">
            <TwemojiText>{reaction.emoji}</TwemojiText>
          </span>
          {reaction.count > 1 && (
            <span className="font-medium text-muted-foreground">{reaction.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
