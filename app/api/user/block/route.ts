import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const blockUserSchema = z.object({
  userId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = blockUserSchema.parse(body)

    const supabase = await createClient()

    // Get current user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is trying to block themselves
    if (authUser.id === validatedData.userId) {
      return NextResponse.json(
        { error: "You cannot block yourself" },
        { status: 400 }
      )
    }

    // Insert block record
    const { error: blockError } = await supabase
      .from("blocks")
      .insert({
        blocker_id: authUser.id,
        blocked_id: validatedData.userId,
      })

    if (blockError) {
      // If it's a unique constraint violation, user is already blocked
      if (blockError.code === "23505") {
        return NextResponse.json(
          { error: "User is already blocked" },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Failed to block user" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Block user error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request data" },
      { status: 400 }
    )
  }
}

// Unblock user
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = blockUserSchema.parse(body)

    const supabase = await createClient()

    // Get current user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete block record
    const { error: unblockError } = await supabase
      .from("blocks")
      .delete()
      .eq("blocker_id", authUser.id)
      .eq("blocked_id", validatedData.userId)

    if (unblockError) {
      return NextResponse.json(
        { error: "Failed to unblock user" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unblock user error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request data" },
      { status: 400 }
    )
  }
}

// Get blocked users list
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

    // Get list of blocked users with their profile info
    const { data: blocks, error } = await supabase
      .from("blocks")
      .select("blocked_id, created_at, blocked:users!blocks_blocked_id_fkey(id, display_name, vibe, age)")
      .eq("blocker_id", authUser.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch blocked users" },
        { status: 500 }
      )
    }

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error("Get blocked users error:", error)
    return NextResponse.json(
      { error: "Failed to fetch blocked users" },
      { status: 500 }
    )
  }
}
