-- Add get_or_create_conversation function if it doesn't exist
-- This function is needed for the chat functionality to work properly

CREATE OR REPLACE FUNCTION get_or_create_conversation(
  user1 UUID,
  user2 UUID
)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
  smaller_id UUID;
  larger_id UUID;
BEGIN
  -- Ensure user1_id < user2_id for consistency
  IF user1 < user2 THEN
    smaller_id := user1;
    larger_id := user2;
  ELSE
    smaller_id := user2;
    larger_id := user1;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conv_id
  FROM conversations
  WHERE user1_id = smaller_id AND user2_id = larger_id;

  -- If not found, create new conversation
  IF conv_id IS NULL THEN
    INSERT INTO conversations (user1_id, user2_id)
    VALUES (smaller_id, larger_id)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
