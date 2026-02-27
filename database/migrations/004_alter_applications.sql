-- Migration 004: Alter applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS scheme_id       INTEGER REFERENCES certification_schemes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS applicant_name  VARCHAR(150),
  ADD COLUMN IF NOT EXISTS applicant_email VARCHAR(150),
  ADD COLUMN IF NOT EXISTS applicant_phone VARCHAR(30);

CREATE INDEX IF NOT EXISTS idx_applications_scheme_id ON applications(scheme_id);
