import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { emailSignupSchema } from "@/lib/validations/auth"
import { generateUniqueUsername } from "@/lib/display-name"
import { getClientIP, getCountryFromIP } from "@/lib/geolocation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = emailSignupSchema.parse(body)

    const supabase = await createClient()

    // Sign up with email and password first to get the user ID
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Email is already registered" },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create account" },
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
        email: validatedData.email,
        gender: validatedData.gender,
        age: validatedData.age,
        is_guest: false,
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
    console.error("Email signup error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request data" },
      { status: 400 }
    )
  }
}
