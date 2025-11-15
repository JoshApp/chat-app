-- Add reply functionality to messages
-- Allows messages to reference a parent message they're replying to

ALTER TABLE messages ADD COLUMN reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Index for efficient lookups of messages that reply to a specific message
CREATE INDEX idx_messages_reply_to ON messages(reply_to_message_id);

-- Note: ON DELETE SET NULL ensures that if a parent message is deleted,
-- the reply still exists but with reply_to_message_id set to null
-- This allows graceful degradation of the reply feature
