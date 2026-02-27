-- Migration: Create certification-related tables
-- Created: 2026-02-25
-- Description: Tables for certifications, applications, assessments, and user activities

-- ============================================
-- 1. CERTIFICATIONS TABLE
-- ============================================
-- Stores certification information for users
CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certification_name VARCHAR(200) NOT NULL,
    certification_type VARCHAR(100), -- e.g., 'Junior Web Developer', 'Graphic Designer'
    certification_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'expired', 'revoked'
    issued_date DATE,
    expiry_date DATE,
    score DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_certification_status CHECK (status IN ('pending', 'active', 'expired', 'revoked'))
);

CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_number ON certifications(certification_number);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(status);

-- ============================================
-- 2. APPLICATIONS TABLE
-- ============================================
-- Stores certification applications/registrations
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certification_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'reviewing', 'approved', 'rejected', 'completed'
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_date TIMESTAMP,
    reviewer_id INTEGER REFERENCES users(id),
    documents JSONB, -- Store document paths/URLs as JSON
    notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_application_status CHECK (status IN ('submitted', 'reviewing', 'approved', 'rejected', 'completed'))
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_date ON applications(application_date);

-- ============================================
-- 3. ASSESSMENTS TABLE
-- ============================================
-- Stores assessment schedules and results
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asesor_id INTEGER REFERENCES users(id),
    assessment_type VARCHAR(100), -- 'written', 'practical', 'interview', 'portfolio'
    scheduled_date TIMESTAMP,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'
    score DECIMAL(5,2),
    result VARCHAR(50), -- 'pass', 'fail', 'pending'
    feedback TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_assessment_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    CONSTRAINT valid_assessment_result CHECK (result IN ('pass', 'fail', 'pending', NULL))
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_asesor_id ON assessments(asesor_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(scheduled_date);

-- ============================================
-- 4. ACTIVITIES TABLE
-- ============================================
-- Stores user activity logs
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- 'login', 'application_submitted', 'assessment_scheduled', 'certificate_issued', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB, -- Store additional data as JSON
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- ============================================
-- 5. NOTIFICATION PREFERENCES (BONUS)
-- ============================================
-- Stores user notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    application_updates BOOLEAN DEFAULT true,
    assessment_reminders BOOLEAN DEFAULT true,
    certificate_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON notification_preferences(user_id);

-- ============================================
-- 6. TRIGGER FOR updated_at
-- ============================================
-- Auto-update updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================
-- Uncomment to insert sample data

/*
-- Sample certification types (you can add more)
INSERT INTO applications (user_id, certification_type, status)
VALUES
    (1, 'Junior Web Developer', 'reviewing'),
    (1, 'Graphic Designer', 'submitted')
ON CONFLICT DO NOTHING;

-- Sample assessment
INSERT INTO assessments (application_id, user_id, assessment_type, scheduled_date, status)
VALUES
    (1, 1, 'practical', CURRENT_TIMESTAMP + INTERVAL '7 days', 'scheduled')
ON CONFLICT DO NOTHING;

-- Sample activities
INSERT INTO activities (user_id, activity_type, title, description)
VALUES
    (1, 'login', 'Login Berhasil', 'User berhasil login ke sistem'),
    (1, 'application_submitted', 'Pendaftaran Sertifikasi', 'Mendaftar sertifikasi Junior Web Developer'),
    (1, 'assessment_scheduled', 'Asesmen Dijadwalkan', 'Asesmen praktis dijadwalkan untuk tanggal 7 hari ke depan')
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- END OF MIGRATION
-- ============================================
