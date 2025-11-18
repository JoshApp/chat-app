-- V1 Migration: Vibe-Based Anonymous Adult Chat
-- This migration transforms the app from basic chat to vibe-matched anonymous chat

-- ============================================================================
-- STEP 1: Modify users table
-- ============================================================================

-- Remove gender column (committed to gender-free V1)
ALTER TABLE users DROP COLUMN IF EXISTS gender;

-- Add vibe column
ALTER TABLE users ADD COLUMN vibe TEXT CHECK (vibe IN ('soft', 'flirty', 'spicy', 'intense'));

-- Add interests array
ALTER TABLE users ADD COLUMN interests TEXT[] DEFAULT '{}';

-- Add status line
ALTER TABLE users ADD COLUMN status_line TEXT CHECK (char_length(status_line) <= 100);

-- Add premium tier
ALTER TABLE users ADD COLUMN premium_tier TEXT DEFAULT 'free' CHECK (premium_tier IN ('free', 'premium'));

-- Add email verification
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX idx_users_vibe ON users(vibe);
CREATE INDEX idx_users_interests ON users USING GIN(interests);
CREATE INDEX idx_users_premium_tier ON users(premium_tier);

-- ============================================================================
-- STEP 2: Create profile_reactions table
-- ============================================================================

CREATE TABLE profile_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reactor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👋', '❤️', '😏', '🔥')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reactor_id, target_id, emoji),
  CHECK (reactor_id != target_id) -- Can't react to yourself
);

-- Indexes for performance
CREATE INDEX idx_profile_reactions_reactor ON profile_reactions(reactor_id);
CREATE INDEX idx_profile_reactions_target ON profile_reactions(target_id);
CREATE INDEX idx_profile_reactions_created_at ON profile_reactions(created_at);

-- Enable RLS
ALTER TABLE profile_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reactions on own profile"
  ON profile_reactions FOR SELECT
  USING (auth.uid() = target_id);

CREATE POLICY "Users can view reactions they sent"
  ON profile_reactions FOR SELECT
  USING (auth.uid() = reactor_id);

CREATE POLICY "Users can add reactions"
  ON profile_reactions FOR INSERT
  WITH CHECK (auth.uid() = reactor_id AND reactor_id != target_id);

CREATE POLICY "Users can delete own reactions"
  ON profile_reactions FOR DELETE
  USING (auth.uid() = reactor_id);

-- ============================================================================
-- STEP 3: Create reaction_quota table
-- ============================================================================

CREATE TABLE reaction_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index for lookups
CREATE INDEX idx_reaction_quota_user_date ON reaction_quota(user_id, date);

-- Enable RLS
ALTER TABLE reaction_quota ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own quota"
  ON reaction_quota FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quota"
  ON reaction_quota FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quota"
  ON reaction_quota FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Create helper functions
-- ============================================================================

-- Function to check if two users have mutual sparks
CREATE OR REPLACE FUNCTION check_mutual_spark(
  user_a UUID,
  user_b UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profile_reactions
    WHERE reactor_id = user_a AND target_id = user_b
  ) AND EXISTS (
    SELECT 1 FROM profile_reactions
    WHERE reactor_id = user_b AND target_id = user_a
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining reaction quota for a user
CREATE OR REPLACE FUNCTION get_reaction_quota(
  user_uuid UUID,
  is_premium BOOLEAN DEFAULT false
)
RETURNS INTEGER AS $$
DECLARE
  daily_count INTEGER;
  daily_limit INTEGER := 5; -- Free tier limit
BEGIN
  -- Premium users have unlimited reactions
  IF is_premium THEN
    RETURN -1; -- -1 indicates unlimited
  END IF;

  -- Get today's reaction count
  SELECT count INTO daily_count
  FROM reaction_quota
  WHERE user_id = user_uuid
    AND date = CURRENT_DATE;

  -- If no record exists, user has full quota
  IF daily_count IS NULL THEN
    RETURN daily_limit;
  END IF;

  -- Return remaining quota
  RETURN GREATEST(0, daily_limit - daily_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment reaction quota (called when user sends a reaction)
CREATE OR REPLACE FUNCTION increment_reaction_quota(
  user_uuid UUID
)
RETURNS void AS $$
BEGIN
  INSERT INTO reaction_quota (user_id, date, count)
  VALUES (user_uuid, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    count = reaction_quota.count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: Update message_reactions table to limit emojis (optional)
-- ============================================================================

-- Note: We're keeping the existing message_reactions table as-is for now
-- The 4-emoji limit is only for profile reactions, not message reactions
-- This keeps backward compatibility with existing message reactions

-- ============================================================================
-- STEP 6: Create indexes for existing tables that benefit from them
-- ============================================================================

-- Index for faster conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Index for faster message lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Notes:
-- - Gender column has been removed (gender-free V1)
-- - Users now have: vibe, interests, status_line, premium_tier, email_verified
-- - Profile reactions system is ready (4 emojis: 👋 ❤️ 😏 🔥)
-- - Reaction quota system enforces 5/day limit for free users
-- - Mutual spark detection via check_mutual_spark() function
-- - All tables have RLS enabled for security
