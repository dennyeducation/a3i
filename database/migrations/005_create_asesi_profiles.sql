-- Migration 005: Create asesi_profiles table
-- Created: 2026-02-26
-- Description: Profil lengkap asesi (peserta sertifikasi) LSP A3I

-- ============================================
-- 1. ASESI PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS asesi_profiles (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Data identitas
    no_identitas        VARCHAR(50),                    -- NIK / No. KTP / No. Paspor
    jenis_kelamin       VARCHAR(20)                     -- LAKI_LAKI | PEREMPUAN
                        CHECK (jenis_kelamin IN ('LAKI_LAKI', 'PEREMPUAN')),
    tanggal_lahir       DATE,
    tingkat_pendidikan  VARCHAR(20)                     -- SD/SMP/SMA/D1/D2/D3/D4/S1/S2/S3
                        CHECK (tingkat_pendidikan IN ('SD','SMP','SMA','SMK','D1','D2','D3','D4','S1','S2','S3')),

    -- Data kontak & domisili
    alamat              TEXT,
    no_whatsapp         VARCHAR(30),

    -- Data pekerjaan
    perusahaan          VARCHAR(200),

    -- Foto profil
    photo               VARCHAR(500),                   -- path atau URL foto

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asesi_profiles_user_id     ON asesi_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_asesi_profiles_no_identitas ON asesi_profiles(no_identitas);

-- ============================================
-- 2. AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_asesi_profiles_updated_at ON asesi_profiles;
CREATE TRIGGER update_asesi_profiles_updated_at
    BEFORE UPDATE ON asesi_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. SAMPLE DATA
-- ============================================
-- Insert asesi_profiles for existing ASESI users (if any)
INSERT INTO asesi_profiles (user_id, no_identitas, jenis_kelamin, tanggal_lahir, tingkat_pendidikan, alamat, no_whatsapp, perusahaan, photo)
SELECT
    u.id,
    CASE ROW_NUMBER() OVER (ORDER BY u.id)
        WHEN 1 THEN '3201012345670001'
        WHEN 2 THEN '3201012345670002'
        WHEN 3 THEN '3201012345670003'
        WHEN 4 THEN '3201012345670004'
        WHEN 5 THEN '3201012345670005'
        ELSE NULL
    END,
    CASE MOD(ROW_NUMBER() OVER (ORDER BY u.id), 2)
        WHEN 0 THEN 'LAKI_LAKI'
        ELSE 'PEREMPUAN'
    END,
    CASE ROW_NUMBER() OVER (ORDER BY u.id)
        WHEN 1 THEN '1995-03-15'::DATE
        WHEN 2 THEN '1998-07-22'::DATE
        WHEN 3 THEN '2000-11-05'::DATE
        WHEN 4 THEN '1993-01-30'::DATE
        WHEN 5 THEN '1997-09-18'::DATE
        ELSE NULL
    END,
    CASE MOD(ROW_NUMBER() OVER (ORDER BY u.id), 4)
        WHEN 0 THEN 'S1'
        WHEN 1 THEN 'D3'
        WHEN 2 THEN 'SMA'
        ELSE 'SMK'
    END,
    CASE ROW_NUMBER() OVER (ORDER BY u.id)
        WHEN 1 THEN 'Jl. Sudirman No. 10, Jakarta Pusat'
        WHEN 2 THEN 'Jl. Gatot Subroto No. 25, Bandung'
        WHEN 3 THEN 'Jl. Malioboro No. 5, Yogyakarta'
        WHEN 4 THEN 'Jl. Thamrin No. 88, Surabaya'
        WHEN 5 THEN 'Jl. Ahmad Yani No. 15, Medan'
        ELSE 'Alamat belum diisi'
    END,
    CASE ROW_NUMBER() OVER (ORDER BY u.id)
        WHEN 1 THEN '081234567001'
        WHEN 2 THEN '081234567002'
        WHEN 3 THEN '081234567003'
        WHEN 4 THEN '081234567004'
        WHEN 5 THEN '081234567005'
        ELSE NULL
    END,
    CASE ROW_NUMBER() OVER (ORDER BY u.id)
        WHEN 1 THEN 'PT Teknologi Nusantara'
        WHEN 2 THEN 'CV Kreatif Digital'
        WHEN 3 THEN 'PT Solusi Inovasi'
        WHEN 4 THEN 'Freelancer'
        WHEN 5 THEN 'PT Maju Bersama'
        ELSE NULL
    END,
    NULL
FROM users u
WHERE u.role = 'ASESI'
ORDER BY u.id
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- END OF MIGRATION
-- ============================================
