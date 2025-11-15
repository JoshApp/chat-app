import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const setCountrySchema = z.object({
  countryCode: z.string().regex(/^[A-Z]{2}$/).nullable(),
})

/**
 * Manual country setting endpoint (useful for testing/development)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = setCountrySchema.parse(body)

    // Update user's country
    const { error: updateError } = await supabase
      .from("users")
      .update({ country_code: validatedData.countryCode })
      .eq("id", authUser.id)

    if (updateError) {
      console.error("Error setting country:", updateError)
      return NextResponse.json({ error: "Failed to set country" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      countryCode: validatedData.countryCode,
    })
  } catch (error) {
    console.error("Set country error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request data" },
      { status: 400 }
    )
  }
}
