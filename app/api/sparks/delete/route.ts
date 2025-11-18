import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const deleteSparkSchema = z.object({
  targetUserId: z.string().uuid(),
})

const ONE_HOUR_MS = 60 * 60 * 1000

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = deleteSparkSchema.parse(body)

    const supabase = await createClient()

    // Get current user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the existing spark to check timing and quota refund eligibility
    const { data: existingSpark, error: fetchError } = await supabase
      .from("profile_reactions")
      .select("created_at, emoji")
      .eq("reactor_id", authUser.id)
      .eq("target_id", validatedData.targetUserId)
      .single()

    if (fetchError || !existingSpark) {
      return NextResponse.json(
        { error: "No spark found to delete" },
        { status: 404 }
      )
    }

    // Check if spark is within 1 hour window
    const sparkAge = Date.now() - new Date(existingSpark.created_at).getTime()
    const canUndo = sparkAge <= ONE_HOUR_MS

    if (!canUndo) {
      return NextResponse.json(
        { error: "Spark is too old to undo (1 hour limit)" },
        { status: 400 }
      )
    }

    // Get user profile to check premium status (for quota refund)
    const { data: userProfile } = await supabase
      .from("users")
      .select("premium_tier")
      .eq("id", authUser.id)
      .single()

    const isPremium = userProfile?.premium_tier === "premium"

    // Delete the spark
    const { error: deleteError } = await supabase
      .from("profile_reactions")
      .delete()
      .eq("reactor_id", authUser.id)
      .eq("target_id", validatedData.targetUserId)

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete spark" },
        { status: 500 }
      )
    }

    // Refund quota (only for non-premium users)
    let quotaRefunded = false
    if (!isPremium) {
      // Get current quota count
      const { data: quotaRecord } = await supabase
        .from("reaction_quota")
        .select("count")
        .eq("user_id", authUser.id)
        .eq("date", new Date().toISOString().split("T")[0])
        .single()

      if (quotaRecord && quotaRecord.count > 0) {
        // Decrement the quota count
        const { error: refundError } = await supabase
          .from("reaction_quota")
          .update({
            count: quotaRecord.count - 1,
          })
          .eq("user_id", authUser.id)
          .eq("date", new Date().toISOString().split("T")[0])

        quotaRefunded = !refundError
      }
    }

    return NextResponse.json({
      success: true,
      quotaRefunded,
      deletedEmoji: existingSpark.emoji,
    })
  } catch (error) {
    console.error("Delete spark error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request data" },
      { status: 400 }
    )
  }
}
