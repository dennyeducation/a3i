-- Migration 013: Create organization_members table
-- Created: 2026-10-15
-- Description: Tabel struktur organisasi lembaga (halaman Profil), dikelola oleh admin

CREATE TABLE IF NOT EXISTS organization_members (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    position       VARCHAR(150) NOT NULL,       -- Jabatan, cth: Ketua LSP, Manajer Mutu
    level          INTEGER NOT NULL DEFAULT 3,   -- Tingkat hierarki: 1 = tertinggi
    display_order  INTEGER NOT NULL DEFAULT 0,   -- Urutan dalam level yang sama
    photo          VARCHAR(500),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_members_level ON organization_members(level);

-- update_updated_at_column() sudah dibuat pada migrasi 003
DROP TRIGGER IF EXISTS update_org_members_updated_at ON organization_members;
CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Data awal, dipindahkan dari konten statis yang sebelumnya hardcoded di app/profil/page.jsx
INSERT INTO organization_members (name, position, level, display_order)
SELECT * FROM (VALUES
    ('Priyono', 'Dewan Pengarah', 1, 0),
    ('I Made Karmayoga', 'Ketua LSP', 2, 0),
    ('Dewi Lestari', 'Manajer Sertifikasi', 3, 0),
    ('Bambang S.', 'Manajer Mutu', 3, 1),
    ('Siti Aminah', 'Manajer Adm & Keu', 3, 2),
    ('Agus Wahyudi', 'Komite Teknis', 3, 3)
) AS seed(name, position, level, display_order)
WHERE NOT EXISTS (SELECT 1 FROM organization_members);
