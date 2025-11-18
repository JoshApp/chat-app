import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check premium status
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("premium_tier")
      .eq("id", authUser.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to get user profile" },
        { status: 500 }
      )
    }

    const isPremium = userProfile.premium_tier === "premium"

    // Get quota
    const { data: remaining, error: quotaError } = await supabase.rpc(
      "get_reaction_quota",
      {
        user_uuid: authUser.id,
        is_premium: isPremium,
      }
    )

    if (quotaError) {
      return NextResponse.json(
        { error: "Failed to check quota" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      remaining: remaining ?? 5, // Default to 5 if no data
      isPremium,
      limit: isPremium ? -1 : 5, // -1 means unlimited
    })
  } catch (error) {
    console.error("Quota check error:", error)
    return NextResponse.json(
      { error: "Failed to check quota" },
      { status: 500 }
    )
  }
}
