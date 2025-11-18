"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { useSparks } from "@/lib/hooks/use-sparks"
import { SparksList } from "@/components/sparks"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { SparkReaction } from "@/lib/hooks/use-sparks"

type SparkTab = "incoming" | "sent" | "mutual"

interface SparksContentProps {
  onIncomingCountChange?: (count: number) => void
  onStartChat?: (userId: string) => void
}

export function SparksContent({ onIncomingCountChange, onStartChat: onStartChatProp }: SparksContentProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { fetchIncomingSparks, fetchSentSparks, fetchMutualSparks, sparkBack, undoSpark } = useSparks()

  const [activeTab, setActiveTab] = useState<SparkTab>("incoming")
  const [incomingSparks, setIncomingSparks] = useState<SparkReaction[]>([])
  const [sentSparks, setSentSparks] = useState<SparkReaction[]>([])
  const [mutualSparks, setMutualSparks] = useState<SparkReaction[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch sparks on mount and when user changes
  useEffect(() => {
    if (!user) return

    const loadSparks = async () => {
      setLoading(true)
      try {
        const [incoming, sent, mutual] = await Promise.all([
          fetchIncomingSparks(),
          fetchSentSparks(),
          fetchMutualSparks(),
        ])
        setIncomingSparks(incoming)
        setSentSparks(sent)
        setMutualSparks(mutual)

        // Notify parent of incoming count (non-mutual only)
        const incomingCount = incoming.filter((s) => !s.isMutual).length
        onIncomingCountChange?.(incomingCount)
      } catch (error) {
        console.error("Error loading sparks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSparks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleSparkBack = async (userId: string, emoji: string): Promise<boolean> => {
    const success = await sparkBack(userId, emoji)
    if (success) {
      // Refresh all lists
      const [incoming, sent, mutual] = await Promise.all([
        fetchIncomingSparks(),
        fetchSentSparks(),
        fetchMutualSparks(),
      ])
      setIncomingSparks(incoming)
      setSentSparks(sent)
      setMutualSparks(mutual)

      // Update count
      const incomingCount = incoming.filter((s) => !s.isMutual).length
      onIncomingCountChange?.(incomingCount)
    }
    return success
  }

  const handleUndo = async (userId: string): Promise<boolean> => {
    const success = await undoSpark(userId)
    if (success) {
      // Refresh sent list
      const sent = await fetchSentSparks()
      setSentSparks(sent)
    }
    return success
  }

  const handleStartChat = async (userId: string) => {
    // If parent provided onStartChat, use that (for embedded in /app page)
    if (onStartChatProp) {
      onStartChatProp(userId)
      return
    }

    // Otherwise, handle navigation ourselves (for standalone /sparks page)
    try {
      // Create or get conversation
      const response = await fetch("/api/conversations/get-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create conversation")
      }

      const data = await response.json()
      router.push(`/app?conversation=${data.conversationId}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SparkTab)} className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-1">Sparks</h2>
        <p className="text-sm text-muted-foreground">
          People who felt something when they saw you
        </p>
      </div>

      <div className="border-b px-4">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
          <TabsTrigger
            value="incoming"
            className={cn(
              "rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
              "px-4 py-3 flex flex-col items-start"
            )}
          >
            <div className="flex items-center gap-2">
              <span>Incoming</span>
              {incomingSparks.filter((s) => !s.isMutual).length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {incomingSparks.filter((s) => !s.isMutual).length}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-normal">People who sparked you</span>
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className={cn(
              "rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
              "px-4 py-3 flex flex-col items-start"
            )}
          >
            <span>Sent</span>
            <span className="text-xs text-muted-foreground font-normal">People you sparked</span>
          </TabsTrigger>
          <TabsTrigger
            value="mutual"
            className={cn(
              "rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
              "px-4 py-3 flex flex-col items-start"
            )}
          >
            <div className="flex items-center gap-2">
              <span>Mutual</span>
              {mutualSparks.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {mutualSparks.length}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-normal">Mutual chemistry</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <TabsContent value="incoming" className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <SparksList
                sparks={incomingSparks}
                type="incoming"
                onSparkBack={handleSparkBack}
                onStartChat={handleStartChat}
              />
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <SparksList
                sparks={sentSparks}
                type="sent"
                onUndo={handleUndo}
                onStartChat={handleStartChat}
              />
            )}
          </TabsContent>

          <TabsContent value="mutual" className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <SparksList
                sparks={mutualSparks}
                type="mutual"
                onStartChat={handleStartChat}
              />
            )}
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  )
}
