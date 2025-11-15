import { getCountryName } from "@/lib/country-flags"
import { cn } from "@/lib/utils"

interface UsernameWithFlagProps {
  username: string
  countryCode?: string | null
  showFlag?: boolean
  className?: string
}

/**
 * Displays a username with an optional country flag icon
 */
export function UsernameWithFlag({
  username,
  countryCode,
  showFlag = true,
  className,
}: UsernameWithFlagProps) {
  const shouldShowFlag = showFlag && countryCode
  const countryName = countryCode ? getCountryName(countryCode) : null

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span>{username}</span>
      {shouldShowFlag && (
        <span
          className={cn(
            "fi",
            `fi-${countryCode!.toLowerCase()}`,
            "inline-block w-4 h-3 rounded-sm"
          )}
          title={countryName || undefined}
          aria-label={countryName || undefined}
          role="img"
        />
      )}
    </span>
  )
}
