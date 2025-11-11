import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { guestSignupSchema } from "@/lib/validations/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = guestSignupSchema.parse(body)

    const supabase = await createClient()

    // Check if username is taken
    let username = validatedData.username
    const { data: existingUser } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single()

    // If username exists, add random suffix
    if (existingUser) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      username = `${username}${randomSuffix}`
    }

    // Sign in anonymously
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously()

    if (authError) {
      return NextResponse.json(
        { error: "Failed to create guest account" },
        { status: 500 }
      )
    }

    // Create user profile
    const { data: user, error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        username,
        gender: validatedData.gender,
        age: validatedData.age,
        is_guest: true,
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

    return NextResponse.json({ user, username })
  } catch (error) {
    console.error("Guest signup error:", error)
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    )
  }
}
