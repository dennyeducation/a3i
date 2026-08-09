-- Migration 010: Add registration_no and form_no to certifications
-- Created: 2026-08-07
-- Description: Adds registration number and blank/form number fields to certifications table

ALTER TABLE certifications
  ADD COLUMN IF NOT EXISTS registration_no VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS form_no         VARCHAR(50) UNIQUE;
