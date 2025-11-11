"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types/database"
import type { User as AuthUser } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  authUser: AuthUser | null
  loading: boolean
  profileLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const isMountedRef = useRef(true)
  const profilePromisesRef = useRef<Map<string, Promise<User | null>>>(new Map())

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const safeSetUser = (value: User | null) => {
    if (isMountedRef.current) {
      setUser(value)
    }
  }

  const safeSetAuthUser = (value: AuthUser | null) => {
    if (isMountedRef.current) {
      setAuthUser(value)
    }
  }

  const safeSetLoading = (value: boolean) => {
    if (isMountedRef.current) {
      setLoading(value)
    }
  }

  const safeSetProfileLoading = (value: boolean) => {
    if (isMountedRef.current) {
      setProfileLoading(value)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    console.log("Fetching profile for user:", userId)
    try {
      console.log("About to execute query...")
      const query = supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      console.log("Query created, awaiting result...")
      const result = await query
      console.log("Query completed!", result)

      const { data, error } = result

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      console.log("Fetched user profile:", data)
      return data
    } catch (error) {
      console.error("Exception fetching user profile:", error)
      return null
    }
  }

  const getProfilePromise = (userId: string) => {
    let promise = profilePromisesRef.current.get(userId)
    if (!promise) {
      promise = fetchUserProfile(userId).finally(() => {
        profilePromisesRef.current.delete(userId)
      })
      profilePromisesRef.current.set(userId, promise)
    }
    return promise
  }

  const loadProfile = async (userId: string) => {
    safeSetProfileLoading(true)
    try {
      const profile = await getProfilePromise(userId)
      console.log("Setting user profile:", profile)
      safeSetUser(profile ?? null)
    } finally {
      safeSetProfileLoading(false)
    }
  }

  const refreshUser = async () => {
    const { data: { user: currentAuthUser } } = await supabase.auth.getUser()

    if (currentAuthUser) {
      safeSetAuthUser(currentAuthUser)
      await loadProfile(currentAuthUser.id)
    } else {
      safeSetAuthUser(null)
      safeSetUser(null)
      safeSetProfileLoading(false)
    }
  }

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      try {
        console.log("Initializing auth...")
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          return
        }

        console.log("Session:", session?.user?.id)

        if (session?.user) {
          safeSetAuthUser(session.user)
          loadProfile(session.user.id)
        } else {
          console.log("No session found")
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        console.log("Setting loading to false")
        safeSetLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        safeSetAuthUser(session.user)
        loadProfile(session.user.id)
      } else {
        safeSetAuthUser(null)
        safeSetUser(null)
        safeSetProfileLoading(false)
      }
      safeSetLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    safeSetUser(null)
    safeSetAuthUser(null)
    safeSetProfileLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{ user, authUser, loading, profileLoading, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
