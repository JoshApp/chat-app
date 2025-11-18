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

    console.log("Fetching conversation with ID:", conversationId)

    // Fetch conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single()

    if (convError || !conversation) {
      console.error("Conversation not found:", conversationId, "Error:", convError)
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    console.log("Conversation found:", conversation.id)

    // Verify user is part of this conversation
    console.log("Verifying user access. AuthUser:", authUser.id, "User1:", conversation.user1_id, "User2:", conversation.user2_id)
    if (conversation.user1_id !== authUser.id && conversation.user2_id !== authUser.id) {
      console.log("User not authorized for this conversation")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get the other user's ID
    const otherUserId =
      conversation.user1_id === authUser.id ? conversation.user2_id : conversation.user1_id

    console.log("Fetching other user:", otherUserId)

    // Fetch other user's details
    const { data: otherUser, error: userError } = await supabase
      .from("users")
      .select("id, username, display_name, age, vibe, country_code, show_country_flag")
      .eq("id", otherUserId)
      .single()

    if (userError) {
      console.error("Error fetching other user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!otherUser) {
      console.error("Other user not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Other user found:", otherUser.id)
    console.log("Returning conversation data")

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        other_user: {
          id: otherUser.id,
          username: otherUser.display_name,
          age: otherUser.age,
          vibe: otherUser.vibe,
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
