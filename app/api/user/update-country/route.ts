import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getClientIP, getCountryFromIP } from "@/lib/geolocation"

/**
 * Backfill endpoint to set country for existing users
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

    // Get current user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get country from IP
    const clientIP = getClientIP(request.headers)
    console.log("[UpdateCountry] Client IP:", clientIP)

    let countryCode: string | null = null
    if (clientIP) {
      countryCode = await getCountryFromIP(clientIP)
      console.log("[UpdateCountry] Country code:", countryCode)
    }

    // Update user's country
    const { error: updateError } = await supabase
      .from("users")
      .update({ country_code: countryCode })
      .eq("id", authUser.id)

    if (updateError) {
      console.error("Error updating country:", updateError)
      return NextResponse.json({ error: "Failed to update country" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      countryCode,
      message: countryCode
        ? `Country updated to ${countryCode}`
        : "No country could be determined from your IP",
    })
  } catch (error) {
    console.error("Update country error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update country" },
      { status: 500 }
    )
  }
}
