-- Create message_reactions table for quick emoji reactions on messages
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one user can only react with the same emoji once per message
  UNIQUE(message_id, user_id, emoji)
);

-- Index for fast lookups by message
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);

-- Index for fast lookups by user
CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);

-- Enable Row Level Security
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all reactions
CREATE POLICY "Users can view reactions"
  ON message_reactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can add their own reactions
CREATE POLICY "Users can add their own reactions"
  ON message_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
  ON message_reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
