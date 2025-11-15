import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendMessageSchema } from "@/lib/validations/message"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = sendMessageSchema.parse(body)

    const supabase = await createClient()

    // Get current user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate reply_to_message_id if provided
    let validatedReplyToMessageId: string | null = null
    if (validatedData.replyToMessageId) {
      const { data: parentMessage, error: parentError } = await supabase
        .from("messages")
        .select("id, conversation_id")
        .eq("id", validatedData.replyToMessageId)
        .single()

      // Only set reply_to_message_id if parent exists and belongs to same conversation
      if (!parentError && parentMessage && parentMessage.conversation_id === validatedData.conversationId) {
        validatedReplyToMessageId = validatedData.replyToMessageId
      } else {
        console.warn("Invalid reply_to_message_id - either doesn't exist or wrong conversation")
      }
    }

    // Insert message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: validatedData.conversationId,
        sender_id: authUser.id,
        content: validatedData.content,
        reply_to_message_id: validatedReplyToMessageId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error sending message:", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
