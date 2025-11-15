-- Migration: Add display_name field to users table
--
-- How it works:
-- - username: Unique identifier derived from display_name (e.g., "Alex", "Alex1", "Alex2")
-- - display_name: User's chosen name (NOT unique, e.g., "Alex", "Alex", "Alex")
--
-- Multiple users can have the same display_name, but username must be unique.

-- Step 1: Add display_name column (allow NULL temporarily for migration)
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Populate display_name from existing username values
-- Existing users keep their current username as both username and display_name
UPDATE users SET display_name = username;

-- Step 3: Make display_name NOT NULL now that it's populated
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;

-- Step 4: Add index on display_name for performance (non-unique index)
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);

-- Note: For existing users, username and display_name will be the same.
-- New users will have username derived from display_name with suffixes as needed.

-- Verification query (commented out, for manual verification)
-- SELECT id, username, display_name FROM users LIMIT 10;
