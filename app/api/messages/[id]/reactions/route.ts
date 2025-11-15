import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/messages/[id]/reactions
 * Fetch all reactions for a message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const messageId = id

    // Fetch all reactions for this message with user info
    const { data: reactions, error: reactionsError } = await supabase
      .from("message_reactions")
      .select(
        `
        id,
        emoji,
        user_id,
        created_at,
        users:user_id (
          id,
          display_name
        )
      `
      )
      .eq("message_id", messageId)
      .order("created_at", { ascending: true })

    if (reactionsError) {
      throw reactionsError
    }

    return NextResponse.json({ reactions })
  } catch (error) {
    console.error("Error fetching reactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/messages/[id]/reactions
 * Toggle a reaction on a message (add if doesn't exist, remove if exists)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const messageId = id

    const { emoji } = await request.json()

    if (!emoji || typeof emoji !== "string") {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 })
    }

    // Get user's profile to link to users table
    const { data: userProfile } = await supabase
      .from("users")
      .select("id")
      .eq("id", authUser.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check if reaction already exists
    const { data: existingReaction } = await supabase
      .from("message_reactions")
      .select("id")
      .eq("message_id", messageId)
      .eq("user_id", userProfile.id)
      .eq("emoji", emoji)
      .maybeSingle()

    if (existingReaction) {
      // Reaction exists, remove it (toggle off)
      const { error: deleteError } = await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existingReaction.id)

      if (deleteError) {
        throw deleteError
      }

      return NextResponse.json({ action: "removed", emoji })
    } else {
      // Reaction doesn't exist, add it (toggle on)
      const { data: newReaction, error: insertError } = await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: userProfile.id,
          emoji,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return NextResponse.json({ action: "added", emoji, reaction: newReaction })
    }
  } catch (error) {
    console.error("Error toggling reaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
