import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateDisplayNameSchema } from "@/lib/validations/auth"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = updateDisplayNameSchema.parse(body)

    const supabase = await createClient()

    // Get current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Use the desired display name directly (no uniqueness check)
    const displayName = validatedData.displayName.trim()

    // Update user's display name
    const { data: user, error: updateError } = await supabase
      .from("users")
      .update({ display_name: displayName })
      .eq("id", authUser.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update display name" },
        { status: 500 }
      )
    }

    return NextResponse.json({ user, displayName })
  } catch (error) {
    console.error("Update display name error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request data" },
      { status: 400 }
    )
  }
}
