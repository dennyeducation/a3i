-- Migration 007: Add image column to certification_schemes
ALTER TABLE certification_schemes
    ADD COLUMN IF NOT EXISTS image VARCHAR(500);
