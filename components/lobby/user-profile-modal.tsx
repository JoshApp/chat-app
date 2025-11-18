"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/chat/user-avatar"
import { UsernameWithFlag } from "@/components/chat/username-with-flag"
import { VibeBadge, getVibeDescription } from "@/components/vibe"
import { InterestTagList } from "@/components/interest-tags"
import { InlineSparkPicker } from "@/components/sparks"
import { useSparks } from "@/lib/hooks/use-sparks"
import { useSparkStatus } from "@/lib/hooks/use-spark-status"
import type { PresenceUser } from "@/lib/hooks/use-presence"
import { MessageCircle, Crown, Sparkles, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface UserProfileModalProps {
  user: PresenceUser | null
  isOpen: boolean
  onClose: () => void
  onStartChat: (userId: string) => void
}

export function UserProfileModal({
  user,
  isOpen,
  onClose,
  onStartChat,
}: UserProfileModalProps) {
  const { sendSpark, undoSpark } = useSparks()
  const { status, loading: statusLoading, refresh: refreshStatus } = useSparkStatus(user?.user_id || null)
  const [sending, setSending] = useState(false)
  const [undoing, setUndoing] = useState(false)

  const isPremium = user?.premium_tier === "premium"

  const handleSelectEmoji = async (emoji: string) => {
    if (!user) return

    setSending(true)
    const success = await sendSpark(user.user_id, emoji)
    if (success) {
      refreshStatus()
    }
    setSending(false)
  }

  const handleUndo = async () => {
    if (!user) return

    setUndoing(true)
    const success = await undoSpark(user.user_id)
    if (success) {
      refreshStatus()
    }
    setUndoing(false)
  }

  const handleStartChat = () => {
    if (!status?.mutual) {
      toast.error("You need a mutual spark to start chatting")
      return
    }
    if (user) {
      onStartChat(user.user_id)
      onClose()
    }
  }

  if (!user) return null

  // Determine which state we're in
  const isNeutralState = !status?.sent && !status?.mutual
  const isSparkSentState = status?.sent && !status?.mutual
  const isMutualState = status?.mutual

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <UserAvatar username={user.display_name} size="md" className="w-16 h-16" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <UsernameWithFlag
                  username={user.display_name}
                  countryCode={user.country_code}
                  showFlag={user.show_country_flag}
                  className="text-xl font-bold truncate"
                />
                {isPremium && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">{user.age} years old</span>
              </div>

              {user.vibe && (
                <div className="space-y-0.5">
                  <VibeBadge vibe={user.vibe} size="sm" />
                  <p className="text-xs text-muted-foreground">
                    {getVibeDescription(user.vibe)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          {user.status_line && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs italic">"{user.status_line}"</p>
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1.5">Interests</h4>
              <InterestTagList tags={user.interests} maxVisible={10} size="sm" />
            </div>
          )}

          {/* STATE 1: NEUTRAL - Show inline spark picker */}
          {isNeutralState && (
            <div className="border-t pt-4">
              <InlineSparkPicker
                onSelectEmoji={handleSelectEmoji}
                disabled={sending || statusLoading}
              />
            </div>
          )}

          {/* STATE 2: SPARK SENT - Show sent emoji + undo button */}
          {isSparkSentState && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <span className="text-3xl">{status.sentEmoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">✨ Spark sent!</p>
                  <p className="text-xs text-muted-foreground">Waiting for them...</p>
                </div>
              </div>

              {status.canUndo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={undoing}
                  className="w-full h-9 text-xs"
                >
                  <Undo2 className="w-3.5 h-3.5 mr-1.5" />
                  {undoing ? "Undoing..." : "Take it back (within 1 hour)"}
                </Button>
              )}
            </div>
          )}

          {/* STATE 3: MUTUAL SPARK - Show celebration + start chat */}
          {isMutualState && (
            <div className="border-t pt-4 space-y-3">
              {/* Celebration banner with animation */}
              <div
                className={cn(
                  "p-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20",
                  "border-2 border-primary/50 rounded-lg",
                  "animate-in fade-in-0 zoom-in-95 duration-500"
                )}
              >
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-lg font-bold text-primary">💫 Mutual Spark!</span>
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  You both felt something. Say hi?
                </p>
              </div>

              <Button
                onClick={handleStartChat}
                size="sm"
                className="w-full h-9"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Say hi
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
