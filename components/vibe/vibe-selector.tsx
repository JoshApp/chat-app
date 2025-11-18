"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Vibe } from "@/lib/types/database"
import { getVibeDescription } from "./vibe-badge"

interface VibeSelectorProps {
  selectedVibe: Vibe | null
  onSelectVibe: (vibe: Vibe) => void
  className?: string
}

const vibeOptions: Array<{
  value: Vibe
  icon: string
  label: string
  description: string
  color: string
  hoverColor: string
  selectedColor: string
}> = [
  {
    value: "soft",
    icon: "💙",
    label: "Soft",
    description: "Gentle, emotional, slow-building",
    color: "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
    hoverColor: "hover:border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/40",
    selectedColor: "border-blue-500 bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500",
  },
  {
    value: "flirty",
    icon: "💛",
    label: "Flirty",
    description: "Playful, teasing, fun energy",
    color: "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20",
    hoverColor: "hover:border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-950/40",
    selectedColor: "border-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 ring-2 ring-yellow-500",
  },
  {
    value: "spicy",
    icon: "💜",
    label: "Spicy",
    description: "Intense flirting, explicit OK",
    color: "border-purple-200 bg-purple-50 dark:bg-purple-950/20",
    hoverColor: "hover:border-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/40",
    selectedColor: "border-purple-500 bg-purple-100 dark:bg-purple-900/50 ring-2 ring-purple-500",
  },
  {
    value: "intense",
    icon: "🔥",
    label: "Intense",
    description: "Raw, direct, no limits",
    color: "border-red-200 bg-red-50 dark:bg-red-950/20",
    hoverColor: "hover:border-red-300 hover:bg-red-100 dark:hover:bg-red-950/40",
    selectedColor: "border-red-500 bg-red-100 dark:bg-red-900/50 ring-2 ring-red-500",
  },
]

export function VibeSelector({ selectedVibe, onSelectVibe, className }: VibeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {vibeOptions.map((option) => {
        const isSelected = selectedVibe === option.value

        return (
          <Card
            key={option.value}
            className={cn(
              "cursor-pointer transition-all duration-200 p-6",
              option.color,
              option.hoverColor,
              isSelected && option.selectedColor
            )}
            onClick={() => onSelectVibe(option.value)}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-4xl">{option.icon}</div>
              <div>
                <h3 className="font-semibold text-lg">{option.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// Compact version for settings page
export function VibeRadioGroup({ selectedVibe, onSelectVibe, className }: VibeSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {vibeOptions.map((option) => {
        const isSelected = selectedVibe === option.value

        return (
          <div
            key={option.value}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
              option.color,
              option.hoverColor,
              isSelected && option.selectedColor
            )}
            onClick={() => onSelectVibe(option.value)}
          >
            <div className="text-2xl">{option.icon}</div>
            <div className="flex-1">
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
            {isSelected && (
              <svg
                className="w-5 h-5 text-current"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}
