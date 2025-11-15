/**
 * Geolocation utility for determining user country from IP address
 * Uses ipapi.co free tier (1,000 requests/day)
 */

interface GeolocationResponse {
  country_code?: string
  error?: boolean
  reason?: string
}

/**
 * Get country code from IP address
 * @param ip - IP address to lookup (IPv4 or IPv6)
 * @returns ISO 3166-1 alpha-2 country code or null if lookup fails
 */
export async function getCountryFromIP(ip: string): Promise<string | null> {
  try {
    // Validate IP format (basic check)
    if (!ip || ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') {
      console.debug('[Geolocation] Skipping local IP:', ip)
      return null
    }

    // Call ipapi.co with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'chat-app-geolocation/1.0',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn('[Geolocation] API returned error status:', response.status)
      return null
    }

    const data: GeolocationResponse = await response.json()

    if (data.error) {
      console.warn('[Geolocation] API returned error:', data.reason)
      return null
    }

    if (!data.country_code) {
      console.warn('[Geolocation] No country code in response')
      return null
    }

    // Validate country code format (2 uppercase letters)
    const countryCode = data.country_code.toUpperCase()
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      console.warn('[Geolocation] Invalid country code format:', countryCode)
      return null
    }

    console.debug('[Geolocation] Successfully determined country:', countryCode)
    return countryCode

  } catch (error) {
    // Handle timeout and network errors gracefully
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('[Geolocation] Request timed out')
      } else {
        console.warn('[Geolocation] Error fetching country:', error.message)
      }
    }
    return null
  }
}

/**
 * Extract real client IP from request headers
 * Handles common proxy headers (x-forwarded-for, x-real-ip)
 * @param headers - Request headers object
 * @returns Client IP address or null
 */
export function getClientIP(headers: Headers): string | null {
  // Check x-forwarded-for header (used by most proxies/load balancers)
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP in the chain (client IP)
    const ip = forwardedFor.split(',')[0].trim()
    if (ip) return ip
  }

  // Check x-real-ip header (alternative header)
  const realIP = headers.get('x-real-ip')
  if (realIP) return realIP.trim()

  // Fallback to other common headers
  const cfConnectingIP = headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIP) return cfConnectingIP.trim()

  const trueClientIP = headers.get('true-client-ip') // Akamai
  if (trueClientIP) return trueClientIP.trim()

  console.warn('[Geolocation] No client IP found in headers')
  return null
}
