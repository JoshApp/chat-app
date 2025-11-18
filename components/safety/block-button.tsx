"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Ban, Check } from "lucide-react"
import toast from "react-hot-toast"

interface BlockButtonProps {
  userId: string
  isBlocked?: boolean
  onBlockStatusChange?: (isBlocked: boolean) => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function BlockButton({
  userId,
  isBlocked = false,
  onBlockStatusChange,
  variant = "outline",
  size = "default",
}: BlockButtonProps) {
  const [blocking, setBlocking] = useState(false)
  const [blocked, setBlocked] = useState(isBlocked)

  const handleBlock = async () => {
    setBlocking(true)

    try {
      const response = await fetch("/api/user/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to block user")
      }

      setBlocked(true)
      toast.success("User blocked")
      onBlockStatusChange?.(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to block user")
    } finally {
      setBlocking(false)
    }
  }

  const handleUnblock = async () => {
    setBlocking(true)

    try {
      const response = await fetch("/api/user/block", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to unblock user")
      }

      setBlocked(false)
      toast.success("User unblocked")
      onBlockStatusChange?.(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unblock user")
    } finally {
      setBlocking(false)
    }
  }

  if (blocked) {
    return (
      <Button
        onClick={handleUnblock}
        disabled={blocking}
        variant={variant}
        size={size}
      >
        <Check className="w-4 h-4 mr-2" />
        {blocking ? "Unblocking..." : "Unblock"}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleBlock}
      disabled={blocking}
      variant={variant}
      size={size}
    >
      <Ban className="w-4 h-4 mr-2" />
      {blocking ? "Blocking..." : "Block User"}
    </Button>
  )
}
