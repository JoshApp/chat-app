import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface MessageBubbleProps {
  content: string
  isMine: boolean
  timestamp: string
  username?: string
}

export function MessageBubble({ content, isMine, timestamp, username }: MessageBubbleProps) {
  return (
    <div className={cn("flex gap-2 mb-4", isMine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[70%] space-y-1")}>
        {!isMine && username && (
          <div className="text-xs text-muted-foreground px-3">{username}</div>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 break-words",
            isMine
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {content}
        </div>
        <div className={cn("text-xs text-muted-foreground px-3", isMine && "text-right")}>
          {format(new Date(timestamp), "h:mm a")}
        </div>
      </div>
    </div>
  )
}
