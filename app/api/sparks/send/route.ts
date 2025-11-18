import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const sendSparkSchema = z.object({
  targetUserId: z.string(),
  emoji: z.enum(["👋", "❤️", "😏", "🔥"]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = sendSparkSchema.parse(body)

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

    // Check reaction quota (unless premium)
    if (!isPremium) {
      const { data: quotaData } = await supabase.rpc("get_reaction_quota", {
        user_uuid: authUser.id,
        is_premium: false,
      })

      if (quotaData !== null && quotaData <= 0) {
        return NextResponse.json(
          { error: "Daily reaction limit reached. Upgrade to premium for unlimited reactions!" },
          { status: 429 }
        )
      }
    }

    // Check if user is trying to react to themselves
    if (authUser.id === validatedData.targetUserId) {
      return NextResponse.json(
        { error: "You cannot react to yourself" },
        { status: 400 }
      )
    }

    // Check if users have blocked each other (either direction)
    const { data: blockExists } = await supabase
      .from("blocks")
      .select("id")
      .or(`and(blocker_id.eq.${authUser.id},blocked_id.eq.${validatedData.targetUserId}),and(blocker_id.eq.${validatedData.targetUserId},blocked_id.eq.${authUser.id})`)
      .limit(1)
      .maybeSingle()

    if (blockExists) {
      return NextResponse.json(
        { error: "Cannot send spark to this user" },
        { status: 403 }
      )
    }

    // Check if spark already exists (to determine if this is an update)
    const { data: existingSpark } = await supabase
      .from("profile_reactions")
      .select("emoji, created_at")
      .eq("reactor_id", authUser.id)
      .eq("target_id", validatedData.targetUserId)
      .maybeSingle()

    const isUpdate = !!existingSpark
    const previousEmoji = existingSpark?.emoji || null

    // UPSERT the reaction (insert or update if exists)
    const { data: reaction, error: reactionError } = await supabase
      .from("profile_reactions")
      .upsert(
        {
          reactor_id: authUser.id,
          target_id: validatedData.targetUserId,
          emoji: validatedData.emoji,
        },
        {
          onConflict: "reactor_id,target_id",
        }
      )
      .select()
      .single()

    if (reactionError) {
      return NextResponse.json(
        { error: "Failed to send reaction" },
        { status: 500 }
      )
    }

    // Increment quota (only for non-premium users AND only for NEW sparks, not updates)
    if (!isPremium && !isUpdate) {
      await supabase.rpc("increment_reaction_quota", {
        user_uuid: authUser.id,
      })
    }

    // Check if this creates a mutual spark
    const { data: isMutual } = await supabase.rpc("check_mutual_spark", {
      user_a: authUser.id,
      user_b: validatedData.targetUserId,
    })

    return NextResponse.json({
      reaction,
      mutualSpark: isMutual === true,
      isUpdate,
      previousEmoji,
    })
  } catch (error) {
    console.error("Send spark error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
