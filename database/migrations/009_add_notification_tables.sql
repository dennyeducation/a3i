-- Migration: Add notification management tables
-- Created: 2026-03-02
-- Description: Tables for notification settings (admin config) and notification logs (sent history)

-- ============================================
-- 1. NOTIFICATION SETTINGS TABLE
-- ============================================
-- Stores global notification configuration (admin-editable)
CREATE TABLE IF NOT EXISTS notification_settings (
    id         SERIAL PRIMARY KEY,
    key        VARCHAR(100) UNIQUE NOT NULL,
    value      TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_settings_key ON notification_settings(key);

-- ============================================
-- 2. NOTIFICATION LOGS TABLE
-- ============================================
-- Stores per-send log (history of sent notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
    id                 SERIAL PRIMARY KEY,
    certification_id   INTEGER NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type               VARCHAR(20)  NOT NULL,           -- email, sms, push
    channel            VARCHAR(50)  NOT NULL,           -- expiry_alert
    subject            VARCHAR(255) NOT NULL,
    recipient_email    VARCHAR(100) NOT NULL,
    days_before        INTEGER      NOT NULL,
    status             VARCHAR(20)  DEFAULT 'pending',  -- pending, sent, failed
    sent_at            TIMESTAMP,
    error_message      TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_notif_status CHECK (status IN ('pending', 'sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_cert_id   ON notification_logs(certification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id   ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status    ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created   ON notification_logs(created_at DESC);

-- ============================================
-- 3. AUTO-UPDATE TRIGGER FOR notification_settings
-- ============================================
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON notification_settings
FOR EACH ROW EXECUTE FUNCTION update_notification_settings_updated_at();

-- ============================================
-- END OF MIGRATION
-- ============================================
