-- Migration: 003_add_username.sql
-- Description: Add username column to users table for custom login flow

-- Add username column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Update RLS policies to allow reading username (public profiles usually allow reading basic info)
-- The existing policy "Users are viewable by everyone" should cover this as it uses (true) for SELECT.
