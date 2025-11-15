-- Migration: Add country tracking for users
-- Stores country code based on IP geolocation at signup
-- Users can control visibility of their country flag

-- Step 1: Add country_code column (ISO 3166-1 alpha-2 format)
ALTER TABLE users ADD COLUMN country_code CHAR(2);

-- Step 2: Add constraint to ensure valid country codes
ALTER TABLE users ADD CONSTRAINT country_code_is_uppercase_alpha2
  CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$');

-- Step 3: Add flag visibility control (default true = show flag)
ALTER TABLE users ADD COLUMN show_country_flag BOOLEAN DEFAULT true;

-- Step 4: Create index for potential country-based queries
CREATE INDEX idx_users_country_code ON users(country_code);

-- Note: Country codes are determined at signup via IP geolocation
-- Users can hide their flag via the show_country_flag setting
-- VPN/proxy users will show their VPN/proxy country
