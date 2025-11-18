import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") // "sent", "received", "incoming", or "mutual"

    // Enhanced user profile fields
    const userFields = "id, display_name, vibe, age, interests, status_line, country_code, show_country_flag, premium_tier"

    if (type === "sent") {
      // Get reactions sent by current user
      const { data: reactions, error } = await supabase
        .from("profile_reactions")
        .select(`*, target:users!profile_reactions_target_id_fkey(${userFields})`)
        .eq("reactor_id", authUser.id)
        .order("created_at", { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch sent reactions" },
          { status: 500 }
        )
      }

      // Check mutual status for each
      const reactionsWithMutual = await Promise.all(
        (reactions || []).map(async (reaction) => {
          const { data: isMutual } = await supabase.rpc("check_mutual_spark", {
            user_a: authUser.id,
            user_b: reaction.target_id,
          })
          return { ...reaction, isMutual: isMutual === true }
        })
      )

      return NextResponse.json({ reactions: reactionsWithMutual })
    } else if (type === "received" || type === "incoming") {
      // Get reactions received by current user
      const { data: reactions, error } = await supabase
        .from("profile_reactions")
        .select(`*, reactor:users!profile_reactions_reactor_id_fkey(${userFields})`)
        .eq("target_id", authUser.id)
        .order("created_at", { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch received reactions" },
          { status: 500 }
        )
      }

      // Check mutual status for each
      const reactionsWithMutual = await Promise.all(
        (reactions || []).map(async (reaction) => {
          const { data: isMutual } = await supabase.rpc("check_mutual_spark", {
            user_a: authUser.id,
            user_b: reaction.reactor_id,
          })
          return { ...reaction, isMutual: isMutual === true }
        })
      )

      return NextResponse.json({ reactions: reactionsWithMutual })
    } else if (type === "mutual") {
      // Get all mutual sparks
      const { data: sentReactions, error: sentError } = await supabase
        .from("profile_reactions")
        .select(`*, target:users!profile_reactions_target_id_fkey(${userFields})`)
        .eq("reactor_id", authUser.id)

      if (sentError) {
        return NextResponse.json(
          { error: "Failed to fetch mutual sparks" },
          { status: 500 }
        )
      }

      // Filter to only mutual ones
      const mutualSparks = []
      for (const reaction of sentReactions || []) {
        const { data: isMutual } = await supabase.rpc("check_mutual_spark", {
          user_a: authUser.id,
          user_b: reaction.target_id,
        })
        if (isMutual === true) {
          mutualSparks.push({ ...reaction, isMutual: true })
        }
      }

      // Sort by most recent
      mutualSparks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return NextResponse.json({ reactions: mutualSparks })
    } else {
      return NextResponse.json(
        { error: "Invalid type parameter. Use 'sent', 'received', 'incoming', or 'mutual'" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Get sparks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    )
  }
}
