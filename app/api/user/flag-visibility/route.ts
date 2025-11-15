import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const flagVisibilitySchema = z.object({
  showFlag: z.boolean(),
})

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = flagVisibilitySchema.parse(body)

    // Update flag visibility
    const { error: updateError } = await supabase
      .from("users")
      .update({ show_country_flag: validatedData.showFlag })
      .eq("id", authUser.id)

    if (updateError) {
      console.error("Error updating flag visibility:", updateError)
      return NextResponse.json({ error: "Failed to update flag visibility" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      showFlag: validatedData.showFlag,
    })
  } catch (error) {
    console.error("Flag visibility update error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request data" },
      { status: 400 }
    )
  }
}
