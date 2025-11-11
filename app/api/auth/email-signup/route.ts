import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { emailSignupSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = emailSignupSchema.parse(body)

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

    // Sign up with email and password
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

    // Create user profile
    const { data: user, error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        username,
        email: validatedData.email,
        gender: validatedData.gender,
        age: validatedData.age,
        is_guest: false,
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
    console.error("Email signup error:", error)
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    )
  }
}
