-- Migration: Add read tracking to messages
-- This enables tracking which messages have been read by the recipient

-- Step 1: Add read_at column to messages table
ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Create indexes for efficient unread message queries
-- Index for finding unread messages (where read_at IS NULL)
CREATE INDEX idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- Index for sender and conversation lookups
CREATE INDEX idx_messages_sender_conversation ON messages(sender_id, conversation_id);

-- Step 3: Add RLS policy to allow users to update messages (mark as read)
CREATE POLICY "Users can update messages in own conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

-- Note: Messages are considered "read" when read_at is NOT NULL
-- To mark a message as read, set read_at = NOW()
-- To find unread messages for a user in a conversation:
--   SELECT * FROM messages
--   WHERE conversation_id = <id>
--   AND sender_id != <current_user_id>
--   AND read_at IS NULL;
