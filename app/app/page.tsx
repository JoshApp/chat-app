"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OnlineUsersList } from "@/components/chat/online-users-list"
import { ConversationsList } from "@/components/chat/conversations-list"
import { ChatView } from "@/components/chat/chat-view"
import { UserAvatar } from "@/components/chat/user-avatar"
import { NotificationBadge } from "@/components/notifications/notification-badge"
import { MessageSquare, Users, Shield, Settings, LogOut, Edit2, Check, X, Bell, BellOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePresence, type PresenceUser } from "@/lib/hooks/use-presence"
import { useNotifications } from "@/lib/contexts/notification-context"
import toast from "react-hot-toast"

type Tab = "online" | "messages" | "safety" | "settings"

export default function AppPage() {
  const { user, authUser, loading, signOut, refreshUser } = useAuth()
  const { onlineUsers } = usePresence()
  const { totalUnread, isMuted, toggleMute } = useNotifications()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>("online")
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string
    otherUser: { id: string; username: string; age: number; gender: string; country_code: string | null; show_country_flag: boolean }
  } | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState("")
  const [isSavingDisplayName, setIsSavingDisplayName] = useState(false)

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

  // Load conversation from URL on mount or URL change
  useEffect(() => {
    if (!user) return // Wait for user to be loaded

    const conversationId = searchParams.get("conversation")

    if (conversationId) {
      // Fetch conversation details from API to get other user info
      fetch(`/api/conversations/${conversationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.conversation) {
            setSelectedConversation({
              id: data.conversation.id,
              otherUser: {
                id: data.conversation.other_user.id,
                username: data.conversation.other_user.username,
                age: data.conversation.other_user.age,
                gender: data.conversation.other_user.gender,
                country_code: data.conversation.other_user.country_code,
                show_country_flag: data.conversation.other_user.show_country_flag,
              },
            })
            setActiveTab("online")
          }
        })
        .catch(error => {
          console.error("Error loading conversation from URL:", error)
        })
    } else {
      // No conversation in URL, clear selection
      setSelectedConversation(null)
    }
  }, [searchParams, user])

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
          username: presenceUser.display_name,
          age: presenceUser.age,
          gender: presenceUser.gender,
          country_code: presenceUser.country_code,
          show_country_flag: presenceUser.show_country_flag,
        },
      })

      // Update URL
      router.push(`/app?conversation=${data.conversationId}`)
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
        country_code: conversation.other_user.country_code,
        show_country_flag: conversation.other_user.show_country_flag,
      },
    })

    // Update URL
    router.push(`/app?conversation=${conversation.id}`)
  }

  const handleLogout = async () => {
    await signOut()
    toast.success("Logged out successfully")
    router.push("/")
  }

  const handleEditDisplayName = () => {
    setNewDisplayName(user?.display_name || "")
    setIsEditingDisplayName(true)
  }

  const handleCancelEditDisplayName = () => {
    setIsEditingDisplayName(false)
    setNewDisplayName("")
  }

  const handleSaveDisplayName = async () => {
    if (!newDisplayName.trim()) {
      toast.error("Display name cannot be empty")
      return
    }

    if (newDisplayName.trim().length < 3) {
      toast.error("Display name must be at least 3 characters")
      return
    }

    if (newDisplayName.trim().length > 20) {
      toast.error("Display name must be at most 20 characters")
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newDisplayName.trim())) {
      toast.error("Display name can only contain letters, numbers, and underscores")
      return
    }

    setIsSavingDisplayName(true)
    try {
      const response = await fetch("/api/user/display-name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: newDisplayName.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update display name")
      }

      // Refresh user data
      await refreshUser()

      toast.success(`Display name updated to "${data.displayName}"`)
      setIsEditingDisplayName(false)
      setNewDisplayName("")
    } catch (error) {
      console.error("Error updating display name:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update display name")
    } finally {
      setIsSavingDisplayName(false)
    }
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
          {/* Notification Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab("messages")}
              onContextMenu={(e) => {
                e.preventDefault()
                toggleMute()
              }}
              title={totalUnread > 0 ? `${totalUnread} unread messages` : "Messages"}
            >
              {isMuted ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </Button>
            <NotificationBadge count={totalUnread} pulse={totalUnread > 0} />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <UserAvatar username={user.display_name} size="sm" />
            <span className="text-sm font-medium">{user.display_name}</span>
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
                className="w-full justify-start relative"
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id !== "messages" && tab.id !== "online") {
                    setSelectedConversation(null)
                  }
                }}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
                {tab.id === "messages" && totalUnread > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
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
            {activeTab === "online" && <OnlineUsersList onlineUsers={onlineUsers} onUserClick={handleUserClick} />}
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
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <p className="text-sm text-muted-foreground">
                      {user.is_guest ? "Guest Account" : "Registered Account"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Display Name</p>
                    {isEditingDisplayName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          placeholder="Enter display name"
                          className="max-w-xs"
                          disabled={isSavingDisplayName}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleSaveDisplayName}
                          disabled={isSavingDisplayName}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelEditDisplayName}
                          disabled={isSavingDisplayName}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{user.display_name}</p>
                        <Button size="icon" variant="ghost" onClick={handleEditDisplayName}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Age</p>
                    <p className="text-sm text-muted-foreground">{user.age}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Gender</p>
                    <p className="text-sm text-muted-foreground">{user.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Country Flag</p>
                    <div className="flex items-center gap-3">
                      {user.country_code && (
                        <span
                          className={`fi fi-${user.country_code.toLowerCase()} inline-block w-8 h-6 rounded`}
                          title={user.country_code}
                          role="img"
                        />
                      )}
                      <Button
                        variant={user.show_country_flag ? "default" : "outline"}
                        size="sm"
                        onClick={async () => {
                          try {
                            const newValue = !user.show_country_flag
                            const response = await fetch("/api/user/flag-visibility", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ showFlag: newValue }),
                            })
                            if (!response.ok) throw new Error("Failed to update flag visibility")
                            await refreshUser()
                            toast.success(newValue ? "Country flag is now visible" : "Country flag is now hidden")
                          } catch (error) {
                            console.error("Error updating flag visibility:", error)
                            toast.error("Failed to update flag visibility")
                          }
                        }}
                      >
                        {user.show_country_flag ? "Visible" : "Hidden"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Control whether other users can see your country flag
                    </p>
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
                onBack={
                  isMobileView
                    ? () => {
                        setSelectedConversation(null)
                        router.push("/app")
                      }
                    : undefined
                }
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
              "flex-1 flex flex-col items-center gap-1 py-3 relative",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <tab.icon className="h-5 w-5" />
              {tab.id === "messages" && (
                <NotificationBadge count={totalUnread} className="-top-2 -right-2" />
              )}
            </div>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
