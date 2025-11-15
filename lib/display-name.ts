import { SupabaseClient } from "@supabase/supabase-js"

const MAX_USERNAME_LENGTH = 20

/**
 * Generates a unique username based on the display name.
 * Adds sequential suffixes (1, 2, 3...) if the base name is taken.
 *
 * @param supabase - Supabase client instance
 * @param displayName - The user's chosen display name
 * @returns A unique username (display name with suffix if needed)
 * @throws Error if unable to generate unique username
 */
export async function generateUniqueUsername(
  supabase: SupabaseClient,
  displayName: string
): Promise<string> {
  const baseName = displayName.trim()

  // Try the base name first
  const { data: existingUser } = await supabase
    .from("users")
    .select("username")
    .eq("username", baseName)
    .single()

  if (!existingUser) {
    return baseName
  }

  // Base name is taken, try with sequential suffixes
  let suffix = 1
  const maxAttempts = 999

  while (suffix <= maxAttempts) {
    const candidateUsername = `${baseName}${suffix}`

    // Ensure username doesn't exceed max length
    if (candidateUsername.length > MAX_USERNAME_LENGTH) {
      throw new Error(
        `Cannot generate unique username. Display name "${baseName}" is too long.`
      )
    }

    // Check if this candidate is available
    const { data: existingWithSuffix } = await supabase
      .from("users")
      .select("username")
      .eq("username", candidateUsername)
      .single()

    if (!existingWithSuffix) {
      return candidateUsername
    }

    suffix++
  }

  throw new Error(
    `Unable to generate unique username for "${baseName}". Too many users with similar names.`
  )
}
