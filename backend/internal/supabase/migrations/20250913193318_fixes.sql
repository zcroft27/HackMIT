-- 1. Make first_name and last_name nullable
ALTER TABLE "user" ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE "user" ALTER COLUMN last_name DROP NOT NULL;

-- 2. Change bottle content from TEXT to VARCHAR(100)
ALTER TABLE bottle ALTER COLUMN content TYPE VARCHAR(100);

-- 3. Convert user id from SERIAL to UUID
-- This is more complex due to foreign key relationships

-- First, add UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add temporary UUID columns to all relevant tables
ALTER TABLE "user" ADD COLUMN id_uuid UUID DEFAULT uuid_generate_v4();
ALTER TABLE ocean ADD COLUMN user_id_uuid UUID;
ALTER TABLE bottle ADD COLUMN user_id_uuid UUID;
ALTER TABLE seen_bottles ADD COLUMN user_id_uuid UUID;

-- Create a mapping of old IDs to new UUIDs
UPDATE ocean o SET user_id_uuid = u.id_uuid FROM "user" u WHERE o.user_id = u.id;
UPDATE bottle b SET user_id_uuid = u.id_uuid FROM "user" u WHERE b.user_id = u.id;
UPDATE seen_bottles sb SET user_id_uuid = u.id_uuid FROM "user" u WHERE sb.user_id = u.id;

-- Drop old foreign key constraints
ALTER TABLE ocean DROP CONSTRAINT IF EXISTS ocean_user_id_fkey;
ALTER TABLE bottle DROP CONSTRAINT IF EXISTS bottle_user_id_fkey;
ALTER TABLE seen_bottles DROP CONSTRAINT IF EXISTS seen_bottles_user_id_fkey;

-- Drop old indexes on user_id columns
DROP INDEX IF EXISTS idx_ocean_user_id;
DROP INDEX IF EXISTS idx_bottle_user_id;
DROP INDEX IF EXISTS idx_bottle_tag_user;
DROP INDEX IF EXISTS idx_seen_bottles_user_id;
DROP INDEX IF EXISTS idx_seen_bottles_user_seen;

-- Drop the primary key constraint on seen_bottles before dropping the column
ALTER TABLE seen_bottles DROP CONSTRAINT IF EXISTS seen_bottles_pkey;

-- Drop the primary key on user table
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_pkey;

-- Drop old columns
ALTER TABLE ocean DROP COLUMN user_id;
ALTER TABLE bottle DROP COLUMN user_id;
ALTER TABLE seen_bottles DROP COLUMN user_id;
ALTER TABLE "user" DROP COLUMN id;

-- Rename UUID columns to id/user_id
ALTER TABLE "user" RENAME COLUMN id_uuid TO id;
ALTER TABLE ocean RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE bottle RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE seen_bottles RENAME COLUMN user_id_uuid TO user_id;

-- Set the new id as primary key
ALTER TABLE "user" ADD PRIMARY KEY (id);

-- Re-create the primary key for seen_bottles table
ALTER TABLE seen_bottles ADD PRIMARY KEY (user_id, bottle_id);

-- Re-create foreign key constraints
ALTER TABLE ocean ADD CONSTRAINT ocean_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE bottle ADD CONSTRAINT bottle_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE seen_bottles ADD CONSTRAINT seen_bottles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- Re-create indexes
CREATE INDEX idx_ocean_user_id ON ocean(user_id);
CREATE INDEX idx_bottle_user_id ON bottle(user_id);
CREATE INDEX idx_bottle_tag_user ON bottle(tag_id, user_id);
CREATE INDEX idx_seen_bottles_user_id ON seen_bottles(user_id);
CREATE INDEX idx_seen_bottles_user_seen ON seen_bottles(user_id, seen_at DESC);

-- Set default for new user records
ALTER TABLE "user" ALTER COLUMN id SET DEFAULT uuid_generate_v4();