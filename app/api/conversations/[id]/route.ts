import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/conversations/[id]
 * Fetch conversation details including other user info
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
    const conversationId = id

    // Fetch conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Verify user is part of this conversation
    if (conversation.user1_id !== authUser.id && conversation.user2_id !== authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get the other user's ID
    const otherUserId =
      conversation.user1_id === authUser.id ? conversation.user2_id : conversation.user1_id

    // Fetch other user's details
    const { data: otherUser, error: userError } = await supabase
      .from("users")
      .select("id, username, display_name, age, gender, country_code, show_country_flag")
      .eq("id", otherUserId)
      .single()

    if (userError || !otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        other_user: {
          id: otherUser.id,
          username: otherUser.display_name,
          age: otherUser.age,
          gender: otherUser.gender,
          country_code: otherUser.country_code,
          show_country_flag: otherUser.show_country_flag,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
