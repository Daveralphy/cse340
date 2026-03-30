-- Migration: Add username column to account table
-- This adds username support for authentication

ALTER TABLE public.account
ADD COLUMN account_username character varying;

-- Create a unique constraint on username (allowing NULL for existing records)
ALTER TABLE public.account
ADD CONSTRAINT account_username_unique UNIQUE (account_username);
