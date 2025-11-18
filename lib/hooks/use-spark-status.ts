"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"

export interface SparkStatus {
  sent: boolean // Did I spark them?
  received: boolean // Did they spark me?
  mutual: boolean // Both sparked each other?
  sentEmoji: string | null // Which emoji did I send?
  receivedEmoji: string | null // Which emoji did they send?
  sentAt: string | null // When did I send the spark?
  canUndo: boolean // Can I undo my spark (within 1 hour)?
}

const ONE_HOUR_MS = 60 * 60 * 1000

export function useSparkStatus(userId: string | null) {
  const { user } = useAuth()
  const [status, setStatus] = useState<SparkStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !userId) {
      setLoading(false)
      return
    }

    const fetchStatus = async () => {
      setLoading(true)
      try {
        // Fetch both sent and received sparks
        const [sentResponse, receivedResponse] = await Promise.all([
          fetch("/api/sparks/get?type=sent"),
          fetch("/api/sparks/get?type=received"),
        ])

        if (!sentResponse.ok || !receivedResponse.ok) {
          throw new Error("Failed to fetch spark status")
        }

        const sentData = await sentResponse.json()
        const receivedData = await receivedResponse.json()

        // Find sparks related to this specific user
        const sentSpark = (sentData.reactions || []).find(
          (r: any) => r.target_id === userId
        )
        const receivedSpark = (receivedData.reactions || []).find(
          (r: any) => r.reactor_id === userId
        )

        // Calculate if undo is possible (within 1 hour)
        let canUndo = false
        if (sentSpark) {
          const sparkAge = Date.now() - new Date(sentSpark.created_at).getTime()
          canUndo = sparkAge <= ONE_HOUR_MS
        }

        setStatus({
          sent: !!sentSpark,
          received: !!receivedSpark,
          mutual: !!sentSpark && !!receivedSpark,
          sentEmoji: sentSpark?.emoji || null,
          receivedEmoji: receivedSpark?.emoji || null,
          sentAt: sentSpark?.created_at || null,
          canUndo,
        })
      } catch (error) {
        console.error("Error fetching spark status:", error)
        setStatus({
          sent: false,
          received: false,
          mutual: false,
          sentEmoji: null,
          receivedEmoji: null,
          sentAt: null,
          canUndo: false,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [user, userId])

  const refresh = () => {
    if (user && userId) {
      setLoading(true)
      // Trigger re-fetch by updating a dummy state
      setStatus((prev) => ({ ...prev! }))
    }
  }

  return {
    status,
    loading,
    refresh,
  }
}
