import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { otherUserId } = body

    if (!otherUserId) {
      return NextResponse.json({ error: "Other user ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check for mutual spark before allowing conversation creation
    const { data: hasMutualSpark, error: sparkError } = await supabase.rpc(
      "check_mutual_spark",
      {
        user_a: authUser.id,
        user_b: otherUserId,
      }
    )

    if (sparkError) {
      console.error("Error checking mutual spark:", sparkError)
      return NextResponse.json(
        { error: "Failed to verify mutual spark" },
        { status: 500 }
      )
    }

    if (!hasMutualSpark) {
      return NextResponse.json(
        { error: "Mutual spark required to start a conversation" },
        { status: 403 }
      )
    }

    // Use the database function to get or create conversation
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      user1: authUser.id,
      user2: otherUserId,
    })

    if (error) {
      console.error("Error getting/creating conversation:", error)
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
    }

    console.log("get_or_create_conversation returned:", data)

    // Verify the conversation exists by fetching it
    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", data)
      .single()

    if (fetchError || !conversation) {
      console.error("Conversation not found after creation:", fetchError)
      return NextResponse.json({ error: "Failed to verify conversation" }, { status: 500 })
    }

    console.log("Conversation verified:", conversation.id)

    return NextResponse.json({ conversationId: data })
  } catch (error) {
    console.error("Conversation creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
