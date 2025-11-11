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

    // Insert message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: validatedData.conversationId,
        sender_id: authUser.id,
        content: validatedData.content,
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
