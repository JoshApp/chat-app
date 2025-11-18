"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import toast from "react-hot-toast"

export interface SparkQuota {
  remaining: number
  isPremium: boolean
  limit: number // -1 means unlimited
}

export interface SparkReaction {
  id: string
  reactor_id: string
  target_id: string
  emoji: string
  created_at: string
  updated_at?: string
  isMutual: boolean
  target?: any
  reactor?: any
}

export function useSparks() {
  const { user } = useAuth()
  const [quota, setQuota] = useState<SparkQuota | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchQuota = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/sparks/quota")
      if (response.ok) {
        const data = await response.json()
        setQuota(data)
      }
    } catch (error) {
      console.error("Failed to fetch spark quota:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuota()
  }, [user])

  const refreshQuota = () => {
    fetchQuota()
  }

  // Fetch incoming sparks (sparks received from others)
  const fetchIncomingSparks = async (): Promise<SparkReaction[]> => {
    try {
      const response = await fetch("/api/sparks/get?type=incoming")
      if (response.ok) {
        const data = await response.json()
        return data.reactions || []
      }
      throw new Error("Failed to fetch incoming sparks")
    } catch (error) {
      console.error("Error fetching incoming sparks:", error)
      toast.error("Failed to load incoming sparks")
      return []
    }
  }

  // Fetch sent sparks (sparks sent to others)
  const fetchSentSparks = async (): Promise<SparkReaction[]> => {
    try {
      const response = await fetch("/api/sparks/get?type=sent")
      if (response.ok) {
        const data = await response.json()
        return data.reactions || []
      }
      throw new Error("Failed to fetch sent sparks")
    } catch (error) {
      console.error("Error fetching sent sparks:", error)
      toast.error("Failed to load sent sparks")
      return []
    }
  }

  // Fetch mutual sparks (both users sparked each other)
  const fetchMutualSparks = async (): Promise<SparkReaction[]> => {
    try {
      const response = await fetch("/api/sparks/get?type=mutual")
      if (response.ok) {
        const data = await response.json()
        return data.reactions || []
      }
      throw new Error("Failed to fetch mutual sparks")
    } catch (error) {
      console.error("Error fetching mutual sparks:", error)
      toast.error("Failed to load mutual sparks")
      return []
    }
  }

  // Undo a spark (within 1 hour)
  const undoSpark = async (targetUserId: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/sparks/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.quotaRefunded) {
          toast.success(`Spark undone! Quota refunded.`)
        } else {
          toast.success("Spark undone!")
        }
        refreshQuota()
        return true
      }

      const error = await response.json()
      toast.error(error.error || "Failed to undo spark")
      return false
    } catch (error) {
      console.error("Error undoing spark:", error)
      toast.error("Failed to undo spark")
      return false
    }
  }

  // Send a spark (or update existing one)
  const sendSpark = async (targetUserId: string, emoji: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/sparks/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, emoji }),
      })

      if (response.ok) {
        const data = await response.json()

        if (data.mutualSpark) {
          toast.success("🎉 Mutual spark! You can now chat!")
        } else if (data.isUpdate) {
          toast.success(`Updated your spark to ${emoji}`)
        } else {
          toast.success("✨ Spark sent!")
        }

        refreshQuota()
        return true
      }

      const error = await response.json()
      toast.error(error.error || "Failed to send spark")
      return false
    } catch (error) {
      console.error("Error sending spark:", error)
      toast.error("Failed to send spark")
      return false
    }
  }

  // Quick spark back (creates mutual match)
  const sparkBack = async (targetUserId: string, emoji: string): Promise<boolean> => {
    const success = await sendSpark(targetUserId, emoji)
    return success
  }

  return {
    quota,
    loading,
    refreshQuota,
    fetchIncomingSparks,
    fetchSentSparks,
    fetchMutualSparks,
    undoSpark,
    sendSpark,
    sparkBack,
  }
}
