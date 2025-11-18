-- Migration: Fix Multi-Spark Bug
-- Changes UNIQUE constraint from (reactor_id, target_id, emoji) to (reactor_id, target_id)
-- This prevents users from sending multiple different emojis to the same person
-- Instead, they can update/change their spark

-- Drop existing unique constraint
ALTER TABLE profile_reactions
DROP CONSTRAINT IF EXISTS profile_reactions_reactor_id_target_id_emoji_key;

-- Add new unique constraint (one spark per user pair)
ALTER TABLE profile_reactions
ADD CONSTRAINT profile_reactions_reactor_id_target_id_key
UNIQUE (reactor_id, target_id);

-- Add updated_at column for tracking spark changes
ALTER TABLE profile_reactions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_profile_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profile_reactions_updated_at ON profile_reactions;

CREATE TRIGGER profile_reactions_updated_at
  BEFORE UPDATE ON profile_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_reactions_updated_at();

-- Note: Existing data with multiple sparks per pair will need cleanup
-- Run this query to keep only the most recent spark per pair:
--
-- DELETE FROM profile_reactions a
-- USING profile_reactions b
-- WHERE a.reactor_id = b.reactor_id
--   AND a.target_id = b.target_id
--   AND a.created_at < b.created_at;
--
-- (Run this BEFORE adding the new constraint if you have existing multi-spark data)
