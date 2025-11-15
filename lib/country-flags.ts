/**
 * Country flag utilities
 * Converts ISO 3166-1 alpha-2 country codes to emoji flags
 */

/**
 * Convert country code to flag emoji
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'CA')
 * @returns Flag emoji or null if invalid/missing country code
 *
 * @example
 * countryCodeToFlag('US') // '🇺🇸'
 * countryCodeToFlag('GB') // '🇬🇧'
 * countryCodeToFlag('CA') // '🇨🇦'
 */
export function countryCodeToFlag(countryCode: string | null | undefined): string | null {
  if (!countryCode) return null

  const code = countryCode.toUpperCase()

  // Validate format (must be exactly 2 uppercase letters)
  if (!/^[A-Z]{2}$/.test(code)) {
    console.warn('[CountryFlags] Invalid country code format:', countryCode)
    return null
  }

  // Regional indicator symbols start at U+1F1E6 (🇦)
  const REGIONAL_INDICATOR_A = 0x1f1e6

  // Convert each letter to its regional indicator symbol
  const firstChar = code.charCodeAt(0) - 65 // 'A' is 65
  const secondChar = code.charCodeAt(1) - 65

  const flag = String.fromCodePoint(
    REGIONAL_INDICATOR_A + firstChar,
    REGIONAL_INDICATOR_A + secondChar
  )

  return flag
}

/**
 * Get country name from country code (for accessibility/tooltips)
 * This is a subset of common countries - expand as needed
 */
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  BE: 'Belgium',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PL: 'Poland',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  JP: 'Japan',
  CN: 'China',
  IN: 'India',
  KR: 'South Korea',
  SG: 'Singapore',
  TH: 'Thailand',
  ID: 'Indonesia',
  PH: 'Philippines',
  VN: 'Vietnam',
  MY: 'Malaysia',
  NZ: 'New Zealand',
  ZA: 'South Africa',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  RU: 'Russia',
  UA: 'Ukraine',
  TR: 'Turkey',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  IL: 'Israel',
  CH: 'Switzerland',
  AT: 'Austria',
  IE: 'Ireland',
  PT: 'Portugal',
  GR: 'Greece',
  CZ: 'Czech Republic',
  RO: 'Romania',
  HU: 'Hungary',
}

/**
 * Get country name from country code
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Country name or the country code itself if not found
 */
export function getCountryName(countryCode: string | null | undefined): string | null {
  if (!countryCode) return null

  const code = countryCode.toUpperCase()
  return COUNTRY_NAMES[code] || code
}

/**
 * Create a flag component props object with flag emoji and accessibility text
 */
export function getFlagProps(countryCode: string | null | undefined) {
  if (!countryCode) return null

  const flag = countryCodeToFlag(countryCode)
  const name = getCountryName(countryCode)

  if (!flag) return null

  return {
    emoji: flag,
    label: name,
    title: name,
    'aria-label': name,
  }
}
