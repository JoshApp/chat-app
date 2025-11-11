# Anonymous Chat App

A lightweight, anonymous chat application built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router & Turbopack
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Styling with dark theme default
- **Supabase** - Database, Authentication (anonymous + email), and Realtime
- **shadcn/ui** - Beautiful UI components
- **zod** - Input validation
- **react-hot-toast** - Toast notifications

## ✅ What's Been Built (Phase 1-5 Complete!)

### Authentication & Landing Page
- ✅ Beautiful responsive landing page with dark theme
- ✅ Guest signup flow (no email required, anonymous)
- ✅ Email login/signup (optional for persistent accounts)
- ✅ Age verification (18+ only) with confirmation modal
- ✅ Terms, Privacy, and Community Guidelines pages
- ✅ Auth context with session management
- ✅ Protected routes with middleware

### Database & Backend
- ✅ Complete database schema (users, conversations, messages, blocks, reports)
- ✅ Row Level Security (RLS) policies for privacy
- ✅ Database functions (get_or_create_conversation, is_blocked)
- ✅ Auth API routes (guest signup, email login, email signup)
- ✅ Messaging API routes (send message, get/create conversation)
- ✅ Supabase client utilities (browser & server)
- ✅ TypeScript types for all database entities

### Chat Application (NEW!)
- ✅ **Responsive app layout** - Desktop 2-column + Mobile full-screen
- ✅ **Navigation** - Sidebar (desktop) + Bottom nav (mobile)
- ✅ **Online users list** - Real-time presence tracking with Supabase
- ✅ **User avatars** - Colored circles with initials
- ✅ **Click to chat** - Start conversations with online users
- ✅ **Conversations list** - Recent chats with last message preview
- ✅ **Real-time messaging** - Instant message delivery
- ✅ **Message bubbles** - Beautiful chat UI (yours right, theirs left)
- ✅ **Message input** - Send with Enter, Shift+Enter for new line
- ✅ **Auto-scroll** - Automatically scrolls to latest message
- ✅ **Timestamps** - Relative time display
- ✅ **Header** - User info and logout button
- ✅ **Tabs** - Online, Messages, Safety (placeholder), Settings

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

**Follow the detailed guide:** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for step-by-step instructions.

**Quick version:**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy the SQL from `supabase/schema.sql` and run it in SQL Editor
3. Enable Realtime for the `messages` table
4. Copy your project URL and anon key
5. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the landing page!

## 📁 Project Structure

```
chat-app/
├── app/
│   ├── api/auth/          # Auth API routes
│   ├── app/               # Main chat app (placeholder)
│   ├── terms/             # Legal pages
│   ├── privacy/
│   ├── guidelines/
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   └── chat/              # Chat components (UserAvatar, MessageBubble, etc.)
├── lib/
│   ├── supabase/          # Supabase client utilities
│   ├── contexts/          # React contexts (auth)
│   ├── types/             # TypeScript types
│   ├── validations/       # Zod schemas
│   └── utils.ts           # Utility functions
├── supabase/
│   └── schema.sql         # Database schema
└── SUPABASE_SETUP.md      # Detailed setup guide
```

## 🔜 Next Steps (Phase 6-11)

### Phase 6: Typing Indicators
- [ ] Implement Supabase Broadcast for typing status
- [ ] Show "Username is typing..." indicator in chat
- [ ] Debounced typing detection

### Phase 7: Safety Features
- [ ] Block user functionality
- [ ] Report user modal with reason selection
- [ ] Blocked users list in Safety tab
- [ ] Unblock functionality

### Phase 8: Unread Messages
- [ ] Add read_at timestamp to messages
- [ ] Calculate unread count per conversation
- [ ] Display unread badge on Messages tab
- [ ] Mark messages as read when opened

### Phase 9: Settings & Profile
- [ ] Profile editing (gender, age)
- [ ] Upgrade guest to registered account
- [ ] Change email/password for registered users
- [ ] Delete account functionality

### Phase 10: Polish & Error Handling
- [ ] Loading states and skeletons
- [ ] Error boundaries
- [ ] Better toast notifications
- [ ] Input validation feedback
- [ ] Handle edge cases (offline, session expiry, etc.)

### Phase 11: Deployment
- [ ] Environment variables for production
- [ ] Supabase production configuration
- [ ] Deploy to Vercel
- [ ] Testing and QA

## 🎯 Current Status

**Phase 1-5 Complete!** 🎉 The core chat application is fully functional!

### ✅ What Works Now:
1. **Sign up** - Create a guest account or register with email
2. **See who's online** - Real-time presence tracking
3. **Start conversations** - Click any online user to chat
4. **Send messages** - Real-time messaging with instant delivery
5. **View conversations** - See all your recent chats
6. **Responsive design** - Works on desktop and mobile

### 🧪 How to Test:
1. Open the app in two different browsers (or incognito + regular)
2. Create two different guest accounts
3. Both users should appear in each other's "Online" tab
4. Click on a user to start chatting
5. Messages appear instantly in real-time!

### 🔨 What's Next:
Optional enhancements like typing indicators, block/report, and unread counts. The app is already usable for chatting!
