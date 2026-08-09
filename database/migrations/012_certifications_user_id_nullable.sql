-- Migration 012: Make certifications.user_id nullable
-- Created: 2026-08-07
-- Description: Allows bulk-imported certificates (e.g. via Excel upload) to be
--              stored without being linked to a registered user account. Such
--              records are identified only by the full_name column.

ALTER TABLE certifications
  ALTER COLUMN user_id DROP NOT NULL;
