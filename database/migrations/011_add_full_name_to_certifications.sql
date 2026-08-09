-- Migration 011: Add full_name to certifications
-- Created: 2026-08-07
-- Description: Adds full_name field (name printed on the certificate) to certifications table

ALTER TABLE certifications
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
