import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { InterestTag } from "@/lib/types/database"

interface InterestBadgeProps {
  tag: InterestTag | string
  size?: "sm" | "md"
  className?: string
  onClick?: () => void
  selected?: boolean
}

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
}

export function InterestBadge({
  tag,
  size = "sm",
  className,
  onClick,
  selected = false,
}: InterestBadgeProps) {
  return (
    <Badge
      variant={selected ? "default" : "secondary"}
      className={cn(
        sizeClasses[size],
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        selected && "bg-primary text-primary-foreground",
        className
      )}
      onClick={onClick}
    >
      {tag}
    </Badge>
  )
}

// Display list of interest tags with overflow handling
interface InterestTagListProps {
  tags: string[]
  maxVisible?: number
  size?: "sm" | "md"
  className?: string
}

export function InterestTagList({
  tags,
  maxVisible = 3,
  size = "sm",
  className,
}: InterestTagListProps) {
  if (tags.length === 0) return null

  const visibleTags = tags.slice(0, maxVisible)
  const hiddenCount = tags.length - maxVisible

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visibleTags.map((tag, index) => (
        <InterestBadge key={`${tag}-${index}`} tag={tag} size={size} />
      ))}
      {hiddenCount > 0 && (
        <Badge
          variant="secondary"
          className={cn(sizeClasses[size], "text-muted-foreground")}
        >
          +{hiddenCount}
        </Badge>
      )}
    </div>
  )
}
