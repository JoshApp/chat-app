"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InterestTagFilter } from "@/components/interest-tags"
import { VibeBadge } from "@/components/vibe"
import type { Vibe } from "@/lib/types/database"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LobbyFilterState {
  vibe: Vibe | "all"
  interests: string[]
  minAge: number
  maxAge: number
}

interface LobbyFiltersProps {
  filters: LobbyFilterState
  onFiltersChange: (filters: LobbyFilterState) => void
  className?: string
  collapsible?: boolean
}

const vibeOptions: Array<{ value: Vibe | "all"; label: string }> = [
  { value: "all", label: "All Vibes" },
  { value: "soft", label: "Soft" },
  { value: "flirty", label: "Flirty" },
  { value: "spicy", label: "Spicy" },
  { value: "intense", label: "Intense" },
]

export function LobbyFilters({
  filters,
  onFiltersChange,
  className,
  collapsible = true,
}: LobbyFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters =
    filters.vibe !== "all" ||
    filters.interests.length > 0 ||
    filters.minAge !== 18 ||
    filters.maxAge !== 100

  const clearAllFilters = () => {
    onFiltersChange({
      vibe: "all",
      interests: [],
      minAge: 18,
      maxAge: 100,
    })
  }

  const filterContent = (
    <div className="space-y-3">
      {/* Vibe filter */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Vibe</Label>
        <div className="flex flex-wrap gap-1.5">
          {vibeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFiltersChange({ ...filters, vibe: option.value })}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                filters.vibe === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {option.value !== "all" ? (
                <span className="flex items-center gap-1">
                  <VibeBadge vibe={option.value as Vibe} showLabel={false} />
                  {option.label}
                </span>
              ) : (
                option.label
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Interest tags filter */}
      <InterestTagFilter
        selectedTags={filters.interests}
        onTagsChange={(interests) => onFiltersChange({ ...filters, interests })}
      />

      {/* Age range filter */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Age Range</Label>
        <div className="flex items-center gap-2">
          <Select
            value={filters.minAge.toString()}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, minAge: parseInt(value) })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 83 }, (_, i) => i + 18).map((age) => (
                <SelectItem key={age} value={age.toString()} className="text-xs">
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground">to</span>

          <Select
            value={filters.maxAge.toString()}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, maxAge: parseInt(value) })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 83 }, (_, i) => i + 18).map((age) => (
                <SelectItem
                  key={age}
                  value={age.toString()}
                  disabled={age < filters.minAge}
                  className="text-xs"
                >
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full h-8 text-xs"
        >
          <X className="w-3 h-3 mr-1.5" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  if (collapsible) {
    return (
      <Card className={className}>
        <div className="p-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Filters</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Active
                </Badge>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {isExpanded && <div className="mt-3">{filterContent}</div>}
        </div>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div className="p-3">
        <h3 className="text-sm font-semibold mb-3">Filters</h3>
        {filterContent}
      </div>
    </Card>
  )
}
