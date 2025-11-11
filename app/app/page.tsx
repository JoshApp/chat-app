"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { OnlineUsersList } from "@/components/chat/online-users-list"
import { ConversationsList } from "@/components/chat/conversations-list"
import { ChatView } from "@/components/chat/chat-view"
import { UserAvatar } from "@/components/chat/user-avatar"
import { MessageSquare, Users, Shield, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PresenceUser } from "@/lib/hooks/use-presence"
import toast from "react-hot-toast"

type Tab = "online" | "messages" | "safety" | "settings"

export default function AppPage() {
  const { user, authUser, loading, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("online")
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string
    otherUser: { id: string; username: string; age: number; gender: string }
  } | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) {
      router.push("/")
    }
  }, [authUser, loading, router])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleUserClick = async (presenceUser: PresenceUser) => {
    try {
      // Prevent chatting with yourself (this should never happen due to UI blocking)
      if (user && presenceUser.user_id === user.id) {
        return
      }

      // Create or get conversation
      const response = await fetch("/api/conversations/get-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: presenceUser.user_id }),
      })

      if (!response.ok) {
        throw new Error("Failed to create conversation")
      }

      const data = await response.json()

      setSelectedConversation({
        id: data.conversationId,
        otherUser: {
          id: presenceUser.user_id,
          username: presenceUser.username,
          age: presenceUser.age,
          gender: presenceUser.gender,
        },
      })
      setActiveTab("messages")
    } catch (error) {
      console.error("Error starting conversation:", error)
      toast.error("Failed to start conversation")
    }
  }

  const handleConversationClick = (conversation: any) => {
    setSelectedConversation({
      id: conversation.id,
      otherUser: {
        id: conversation.other_user.id,
        username: conversation.other_user.username,
        age: conversation.other_user.age,
        gender: conversation.other_user.gender,
      },
    })
  }

  const handleLogout = async () => {
    await signOut()
    toast.success("Logged out successfully")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: "online" as Tab, label: "Online", icon: Users },
    { id: "messages" as Tab, label: "Messages", icon: MessageSquare },
    { id: "safety" as Tab, label: "Safety", icon: Shield },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ]

  const showChat = selectedConversation && (activeTab === "messages" || activeTab === "online")

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Chat App</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <UserAvatar username={user.username} size="sm" />
            <span className="text-sm font-medium">{user.username}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:w-64 border-r flex-col">
          <nav className="p-2 space-y-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id !== "messages" && tab.id !== "online") {
                    setSelectedConversation(null)
                  }
                }}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - List View */}
          <div
            className={cn(
              "flex-1 lg:max-w-md border-r",
              isMobileView && showChat && "hidden"
            )}
          >
            {activeTab === "online" && <OnlineUsersList onUserClick={handleUserClick} />}
            {activeTab === "messages" && (
              <ConversationsList onConversationClick={handleConversationClick} />
            )}
            {activeTab === "safety" && (
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">Safety Center</h2>
                <p className="text-muted-foreground">Safety features coming soon...</p>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <p className="text-sm text-muted-foreground">
                      {user.is_guest ? "Guest Account" : "Registered Account"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-sm text-muted-foreground">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Age</p>
                    <p className="text-sm text-muted-foreground">{user.age}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Gender</p>
                    <p className="text-sm text-muted-foreground">{user.gender}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Chat View */}
          <div
            className={cn(
              "flex-1",
              !showChat && "hidden lg:flex items-center justify-center",
              isMobileView && !showChat && "hidden"
            )}
          >
            {showChat ? (
              <ChatView
                conversationId={selectedConversation.id}
                otherUser={selectedConversation.otherUser}
                onBack={isMobileView ? () => setSelectedConversation(null) : undefined}
              />
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden border-t flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              if (tab.id !== "messages" && tab.id !== "online") {
                setSelectedConversation(null)
              }
            }}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
