import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { guestSignupSchema } from "@/lib/validations/auth"
import { generateUniqueUsername } from "@/lib/display-name"
import { getClientIP, getCountryFromIP } from "@/lib/geolocation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = guestSignupSchema.parse(body)

    const supabase = await createClient()

    // Sign in anonymously first to get the user ID
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously()

    if (authError) {
      return NextResponse.json(
        { error: "Failed to create guest account" },
        { status: 500 }
      )
    }

    // Use the desired display name directly (no uniqueness check)
    const displayName = validatedData.username.trim()

    // Generate unique username based on display name with suffix if needed
    const username = await generateUniqueUsername(supabase, displayName)

    // Get country from IP geolocation (non-blocking - if it fails, user is still created)
    const clientIP = getClientIP(request.headers)
    let countryCode: string | null = null
    if (clientIP) {
      countryCode = await getCountryFromIP(clientIP)
    }

    // Create user profile
    const { data: user, error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        username,
        display_name: displayName,
        gender: validatedData.gender,
        age: validatedData.age,
        is_guest: true,
        country_code: countryCode,
        age_verified_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({ user, displayName })
  } catch (error) {
    console.error("Guest signup error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request data" },
      { status: 400 }
    )
  }
}
