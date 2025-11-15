"use client"

import Twemoji from "react-twemoji"

interface TwemojiTextProps {
  children: string
  className?: string
}

/**
 * Wraps text content and renders emojis as Twemoji SVGs for consistent cross-platform display
 */
export function TwemojiText({ children, className }: TwemojiTextProps) {
  return (
    <Twemoji
      options={{
        className: className || "inline-block align-middle w-[1.2em] h-[1.2em]",
      }}
    >
      {children}
    </Twemoji>
  )
}
