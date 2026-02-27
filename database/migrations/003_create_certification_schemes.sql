-- Migration: Create certification schemes table
-- Created: 2026-02-26
-- Description: Tabel skema sertifikasi kompetensi LSP A3I

-- ============================================
-- 1. CERTIFICATION SCHEMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS certification_schemes (
    id           SERIAL PRIMARY KEY,
    code         VARCHAR(50)  UNIQUE NOT NULL,                -- Kode skema, cth: SKK-TI-001
    name         VARCHAR(200) NOT NULL,                       -- Nama skema sertifikasi
    description  TEXT,                                        -- Deskripsi skema
    category     VARCHAR(100),                               -- Bidang/kategori, cth: Teknologi Informasi
    level        VARCHAR(50),                                 -- Level KKNI: 1-9 atau Dasar/Menengah/Lanjut
    duration_months  INTEGER DEFAULT 36,                      -- Masa berlaku sertifikat (bulan)
    requirements TEXT,                                        -- Persyaratan peserta
    competency_units JSONB DEFAULT '[]'::jsonb,              -- Unit-unit kompetensi (array JSON)
    status       VARCHAR(20) DEFAULT 'draft'                 -- draft | active | inactive
                 CHECK (status IN ('draft', 'active', 'inactive')),
    created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schemes_code   ON certification_schemes(code);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON certification_schemes(status);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON certification_schemes(category);

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

DROP TRIGGER IF EXISTS update_schemes_updated_at ON certification_schemes;
CREATE TRIGGER update_schemes_updated_at
    BEFORE UPDATE ON certification_schemes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. LINK CERTIFICATIONS TO SCHEME (optional FK)
-- ============================================
-- Tambahkan kolom scheme_id ke tabel certifications jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'certifications' AND column_name = 'scheme_id'
    ) THEN
        ALTER TABLE certifications
            ADD COLUMN scheme_id INTEGER REFERENCES certification_schemes(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_certifications_scheme_id ON certifications(scheme_id);
    END IF;
END;
$$;

-- ============================================
-- 4. SAMPLE DATA
-- ============================================
INSERT INTO certification_schemes (code, name, description, category, level, duration_months, requirements, competency_units, status)
VALUES
(
    'SKK-TI-JWD-001',
    'Junior Web Developer',
    'Skema sertifikasi kompetensi untuk pengembang web tingkat junior yang mencakup pembuatan antarmuka web statis dan dinamis.',
    'Teknologi Informasi',
    'Level 4 KKNI',
    36,
    '1. Pendidikan minimal SMK/SMA sederajat bidang TI\n2. Mampu mengoperasikan komputer\n3. Memiliki pengetahuan dasar HTML, CSS, dan JavaScript',
    '[
        {"code": "J.620100.001.01", "name": "Menggunakan Perangkat Lunak Pengembang Web", "standard": "SKKNI"},
        {"code": "J.620100.002.01", "name": "Membuat Halaman Web Statis", "standard": "SKKNI"},
        {"code": "J.620100.003.01", "name": "Membuat Halaman Web Dinamis", "standard": "SKKNI"},
        {"code": "J.620100.004.01", "name": "Mengintegrasikan Antarmuka Pengguna dengan Logika Bisnis", "standard": "SKKNI"}
    ]'::jsonb,
    'active'
),
(
    'SKK-TI-GD-001',
    'Graphic Designer',
    'Skema sertifikasi kompetensi untuk desainer grafis yang mencakup pembuatan karya visual untuk media cetak dan digital.',
    'Desain Komunikasi Visual',
    'Level 4 KKNI',
    36,
    '1. Pendidikan minimal SMK/SMA sederajat\n2. Mampu mengoperasikan perangkat lunak desain grafis\n3. Memiliki portofolio karya desain',
    '[
        {"code": "M.74100.001.02", "name": "Menerapkan Prinsip Dasar Komunikasi Visual", "standard": "SKKNI"},
        {"code": "M.74100.002.02", "name": "Menggunakan Perangkat Lunak Desain Grafis", "standard": "SKKNI"},
        {"code": "M.74100.003.02", "name": "Membuat Karya Desain Grafis", "standard": "SKKNI"}
    ]'::jsonb,
    'active'
),
(
    'SKK-TI-NET-001',
    'Junior Network Administrator',
    'Skema sertifikasi kompetensi untuk administrator jaringan tingkat junior yang mencakup instalasi dan konfigurasi jaringan dasar.',
    'Teknologi Informasi',
    'Level 4 KKNI',
    36,
    '1. Pendidikan minimal SMK/SMA bidang Teknik Komputer & Jaringan\n2. Memahami dasar-dasar jaringan komputer\n3. Mampu mengoperasikan perangkat jaringan',
    '[
        {"code": "J.611000.001.01", "name": "Memasang Jaringan Lokal (LAN)", "standard": "SKKNI"},
        {"code": "J.611000.002.01", "name": "Mengkonfigurasi Perangkat Jaringan", "standard": "SKKNI"},
        {"code": "J.611000.003.01", "name": "Menguji Koneksi Jaringan", "standard": "SKKNI"}
    ]'::jsonb,
    'active'
),
(
    'SKK-TI-DA-001',
    'Data Analyst',
    'Skema sertifikasi kompetensi untuk analis data yang mencakup pengolahan, analisis, dan visualisasi data.',
    'Teknologi Informasi',
    'Level 5 KKNI',
    36,
    '1. Pendidikan minimal D3/S1 bidang TI atau Statistik\n2. Memahami dasar-dasar statistik\n3. Mampu menggunakan tool analisis data',
    '[
        {"code": "J.620900.001.01", "name": "Mengumpulkan dan Mempersiapkan Data", "standard": "SKKNI"},
        {"code": "J.620900.002.01", "name": "Menganalisis Data menggunakan Metode Statistik", "standard": "SKKNI"},
        {"code": "J.620900.003.01", "name": "Memvisualisasikan Data", "standard": "SKKNI"},
        {"code": "J.620900.004.01", "name": "Menyajikan Hasil Analisis", "standard": "SKKNI"}
    ]'::jsonb,
    'draft'
)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- END OF MIGRATION
-- ============================================
