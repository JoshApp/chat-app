"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const lastPlayedRef = useRef<number>(0)
  const DEBOUNCE_MS = 1000 // Prevent playing sound too frequently

  useEffect(() => {
    // Initialize audio element
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/notification.mp3")
      audioRef.current.volume = 0.5

      // Load mute preference from localStorage
      const savedMuteState = localStorage.getItem("notification_muted")
      if (savedMuteState !== null) {
        setIsMuted(savedMuteState === "true")
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const play = useCallback(() => {
    if (isMuted || !audioRef.current) return

    // Debounce to prevent rapid-fire sounds
    const now = Date.now()
    if (now - lastPlayedRef.current < DEBOUNCE_MS) {
      return
    }

    lastPlayedRef.current = now

    // Reset and play
    audioRef.current.currentTime = 0
    audioRef.current.play().catch((error) => {
      // Handle autoplay restrictions gracefully
      console.warn("Notification sound blocked:", error)
    })
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev
      localStorage.setItem("notification_muted", String(newState))
      return newState
    })
  }, [])

  return {
    play,
    isMuted,
    toggleMute,
  }
}
