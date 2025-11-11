# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: chat-app (or any name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project" (takes ~2 minutes to provision)

## Step 2: Get API Keys

1. Once project is ready, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

3. Create a `.env.local` file in your project root:
   ```bash
   cp .env.local.example .env.local
   ```

4. Paste your values into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
   ```

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/schema.sql` from this project
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is normal!

## Step 4: Enable Realtime

1. Go to **Database** → **Replication**
2. Find the `messages` table
3. Toggle on the **Realtime** switch
4. Click "Save"

## Step 5: Verify Setup

Run the development server:
```bash
npm run dev
```

If everything is configured correctly, you should be able to access the app at http://localhost:3000

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the full anon key (it's very long)
- Make sure there are no extra spaces or line breaks
- Restart your dev server after changing .env.local

### SQL errors when running schema
- Make sure you're running the complete schema.sql file
- If you get "already exists" errors, you may have run it twice - that's okay

### Realtime not working
- Verify Realtime is enabled for the messages table
- Check browser console for connection errors
- Make sure your Supabase project is not paused (free tier pauses after 7 days of inactivity)
