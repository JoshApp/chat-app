"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { INTEREST_TAGS, type InterestTag } from "@/lib/types/database"
import { InterestBadge } from "./interest-badge"

interface InterestTagPickerProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  maxTags?: number
  className?: string
}

export function InterestTagPicker({
  selectedTags,
  onTagsChange,
  maxTags = 3,
  className,
}: InterestTagPickerProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      // Add tag if under limit
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tag])
      }
    }
  }

  const isTagSelected = (tag: string) => selectedTags.includes(tag)
  const isMaxReached = selectedTags.length >= maxTags

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          Select your interests (up to {maxTags})
        </Label>
        <span className="text-sm text-muted-foreground">
          {selectedTags.length}/{maxTags}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INTEREST_TAGS.map((tag) => {
          const selected = isTagSelected(tag)
          const disabled = !selected && isMaxReached

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              disabled={disabled}
              className={cn(
                "text-left p-3 rounded-lg border-2 transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                selected && "border-primary bg-primary/10",
                disabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent"
              )}
            >
              <div className="font-medium text-sm">{tag}</div>
            </button>
          )
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="pt-2">
          <Label className="text-sm text-muted-foreground mb-2 block">
            Selected:
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <InterestBadge
                key={tag}
                tag={tag}
                size="md"
                selected
                onClick={() => toggleTag(tag)}
                className="cursor-pointer"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Compact checkbox version for filters
export function InterestTagFilter({
  selectedTags,
  onTagsChange,
  className,
}: Omit<InterestTagPickerProps, "maxTags">) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">Filter by Interests</Label>
      <div className="flex flex-wrap gap-2">
        {INTEREST_TAGS.map((tag) => (
          <InterestBadge
            key={tag}
            tag={tag}
            size="sm"
            selected={selectedTags.includes(tag)}
            onClick={() => toggleTag(tag)}
          />
        ))}
      </div>
      {selectedTags.length > 0 && (
        <button
          type="button"
          onClick={() => onTagsChange([])}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
