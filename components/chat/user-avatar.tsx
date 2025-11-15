import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  username: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
]

function getColorForUsername(username: string): string {
  if (!username) return colors[0]

  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(username: string): string {
  if (!username) return "??"
  return username.substring(0, 2).toUpperCase()
}

export function UserAvatar({ username, size = "md", className }: UserAvatarProps) {
  const color = getColorForUsername(username)
  const initials = getInitials(username)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className={cn(color, "text-white font-semibold")}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
