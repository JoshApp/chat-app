import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const reportUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.enum([
    "spam",
    "harassment",
    "inappropriate_content",
    "fake_profile",
    "underage",
    "other",
  ]),
  details: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = reportUserSchema.parse(body)

    const supabase = await createClient()

    // Get current user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is trying to report themselves
    if (authUser.id === validatedData.userId) {
      return NextResponse.json(
        { error: "You cannot report yourself" },
        { status: 400 }
      )
    }

    // Insert report record
    const { error: reportError } = await supabase.from("reports").insert({
      reporter_id: authUser.id,
      reported_id: validatedData.userId,
      reason: validatedData.reason,
      details: validatedData.details || null,
      status: "pending",
    })

    if (reportError) {
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Report user error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request data" },
      { status: 400 }
    )
  }
}
