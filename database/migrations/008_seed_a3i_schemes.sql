-- Migration 008: Seed skema sertifikasi A3I (Alat Angkat dan Angkut)
-- Hapus data sampel yang tidak relevan, masukkan skema resmi A3I

DELETE FROM certification_schemes
WHERE code IN ('SKK-TI-JWD-001','SKK-TI-GD-001','SKK-TI-NET-001','SKK-TI-DA-001');

INSERT INTO certification_schemes (code, name, description, category, level, duration_months, requirements, competency_units, status)
VALUES
(
    'SKK-AA-RG-001',
    'Rigger',
    'Skema sertifikasi kompetensi untuk juru ikat (rigger) yang bertanggung jawab dalam pengikatan dan pengamanan beban sebelum pengangkatan oleh crane.',
    'Alat Angkat dan Angkut',
    'Level 2 KKNI',
    36,
    '1. Usia minimal 18 tahun
2. Pendidikan minimal SMP/sederajat
3. Sehat jasmani dan rohani (dilengkapi surat keterangan dokter)
4. Berpengalaman di bidang rigging minimal 6 bulan atau mengikuti pelatihan terkait',
    '[
        {"code": "B.05RIG00.001.1", "name": "Menerapkan Keselamatan dan Kesehatan Kerja (K3) di Area Kerja", "standard": "SKKNI"},
        {"code": "B.05RIG00.002.1", "name": "Melakukan Inspeksi Peralatan Rigging", "standard": "SKKNI"},
        {"code": "B.05RIG00.003.1", "name": "Melakukan Pengikatan Beban (Slinging)", "standard": "SKKNI"},
        {"code": "B.05RIG00.004.1", "name": "Memberikan Isyarat Tangan kepada Operator Crane", "standard": "SKKNI"},
        {"code": "B.05RIG00.005.1", "name": "Memperkirakan Berat Beban dan Titik Keseimbangan", "standard": "SKKNI"}
    ]'::jsonb,
    'active'
),
(
    'SKK-AA-ARG-001',
    'Asisten Rigger',
    'Skema sertifikasi kompetensi untuk asisten juru ikat yang membantu rigger dalam persiapan dan pelaksanaan pekerjaan pengikatan beban.',
    'Alat Angkat dan Angkut',
    'Level 1 KKNI',
    36,
    '1. Usia minimal 18 tahun
2. Pendidikan minimal SMP/sederajat
3. Sehat jasmani dan rohani (dilengkapi surat keterangan dokter)',
    '[
        {"code": "B.05ARG00.001.1", "name": "Menerapkan K3 Dasar di Lingkungan Kerja", "standard": "SKKNI"},
        {"code": "B.05ARG00.002.1", "name": "Mengenal dan Merawat Peralatan Rigging", "standard": "SKKNI"},
        {"code": "B.05ARG00.003.1", "name": "Membantu Persiapan Pekerjaan Pengikatan Beban", "standard": "SKKNI"},
        {"code": "B.05ARG00.004.1", "name": "Melaksanakan Instruksi Rigger", "standard": "SKKNI"}
    ]'::jsonb,
    'active'
),
(
    'SKK-AA-OCM-001',
    'Operator Crane Mobil',
    'Skema sertifikasi kompetensi untuk operator crane mobil (mobile crane) dalam mengangkat, memindahkan, dan menurunkan beban secara aman sesuai prosedur.',
    'Alat Angkat dan Angkut',
    'Level 2 KKNI',
    36,
    '1. Usia minimal 21 tahun
2. Pendidikan minimal SMA/SMK sederajat
3. Memiliki SIM B umum
4. Sehat jasmani dan rohani (dilengkapi surat keterangan dokter)
5. Berpengalaman mengoperasikan crane atau mengikuti pelatihan operator crane',
    '[
        {"code": "B.05OCM00.001.1", "name": "Menerapkan K3 dalam Pengoperasian Crane Mobil", "standard": "SKKNI"},
        {"code": "B.05OCM00.002.1", "name": "Melakukan Pemeriksaan Harian (Pre-Operation Inspection)", "standard": "SKKNI"},
        {"code": "B.05OCM00.003.1", "name": "Membaca dan Memahami Tabel Kapasitas Angkat (Load Chart)", "standard": "SKKNI"},
        {"code": "B.05OCM00.004.1", "name": "Mendirikan dan Melipat Outrigger", "standard": "SKKNI"},
        {"code": "B.05OCM00.005.1", "name": "Mengoperasikan Crane Mobil untuk Pengangkatan Beban", "standard": "SKKNI"},
        {"code": "B.05OCM00.006.1", "name": "Melakukan Komunikasi dengan Rigger dan Tim Lapangan", "standard": "SKKNI"}
    ]'::jsonb,
    'active'
),
(
    'SKK-AA-OPC-001',
    'Operator Pedestal Crane',
    'Skema sertifikasi kompetensi untuk operator pedestal crane (crane putar tetap) yang digunakan di industri, pelabuhan, atau konstruksi dengan instalasi tetap.',
    'Alat Angkat dan Angkut',
    'Level 2 KKNI',
    36,
    '1. Usia minimal 21 tahun
2. Pendidikan minimal SMA/SMK sederajat
3. Sehat jasmani dan rohani (dilengkapi surat keterangan dokter)
4. Berpengalaman di bidang pengoperasian crane atau mengikuti pelatihan terkait',
    '[
        {"code": "B.05OPC00.001.1", "name": "Menerapkan K3 dalam Pengoperasian Pedestal Crane", "standard": "SKKNI"},
        {"code": "B.05OPC00.002.1", "name": "Melakukan Pemeriksaan Sebelum Operasi", "standard": "SKKNI"},
        {"code": "B.05OPC00.003.1", "name": "Membaca Diagram Beban dan Jangkauan Pedestal Crane", "standard": "SKKNI"},
        {"code": "B.05OPC00.004.1", "name": "Mengoperasikan Pedestal Crane untuk Pengangkatan", "standard": "SKKNI"},
        {"code": "B.05OPC00.005.1", "name": "Melakukan Perawatan Rutin Harian", "standard": "SKKNI"}
    ]'::jsonb,
    'active'
),
(
    'SKK-AA-OCJ-001',
    'Operator Crane Jembatan',
    'Skema sertifikasi kompetensi untuk operator crane jembatan (overhead crane/bridge crane) yang digunakan di pabrik, gudang, dan fasilitas industri.',
    'Alat Angkat dan Angkut',
    'Level 2 KKNI',
    36,
    '1. Usia minimal 18 tahun
2. Pendidikan minimal SMA/SMK sederajat
3. Sehat jasmani dan rohani (dilengkapi surat keterangan dokter)
4. Mampu membaca instruksi teknis dalam bahasa Indonesia',
    '[
        {"code": "B.05OCJ00.001.1", "name": "Menerapkan K3 dalam Pengoperasian Crane Jembatan", "standard": "SKKNI"},
        {"code": "B.05OCJ00.002.1", "name": "Melakukan Pemeriksaan Harian Crane Jembatan", "standard": "SKKNI"},
        {"code": "B.05OCJ00.003.1", "name": "Mengoperasikan Crane Jembatan (Gerakan Hoist, Traversing, Traveling)", "standard": "SKKNI"},
        {"code": "B.05OCJ00.004.1", "name": "Melakukan Pengangkatan Beban Sesuai Kapasitas", "standard": "SKKNI"},
        {"code": "B.05OCJ00.005.1", "name": "Menangani Kondisi Darurat pada Crane Jembatan", "standard": "SKKNI"}
    ]'::jsonb,
    'active'
),
(
    'SKK-AA-OFL-001',
    'Operator Forklift',
    'Skema sertifikasi kompetensi untuk operator forklift dalam mengoperasikan kendaraan forklift secara aman untuk kegiatan bongkar muat, pemindahan, dan penyimpanan barang.',
    'Alat Angkat dan Angkut',
    'Level 2 KKNI',
    36,
    '1. Usia minimal 18 tahun
2. Pendidikan minimal SMP/sederajat
3. Memiliki SIM A (diutamakan)
4. Sehat jasmani dan rohani, tidak buta warna (dilengkapi surat keterangan dokter)',
    '[
        {"code": "B.05OFL00.001.1", "name": "Menerapkan K3 dalam Pengoperasian Forklift", "standard": "SKKNI"},
        {"code": "B.05OFL00.002.1", "name": "Melakukan Pemeriksaan Kendaraan Forklift Sebelum Operasi", "standard": "SKKNI"},
        {"code": "B.05OFL00.003.1", "name": "Mengoperasikan Forklift pada Area Datar dan Landai", "standard": "SKKNI"},
        {"code": "B.05OFL00.004.1", "name": "Melakukan Pengangkatan dan Pemindahan Beban dengan Forklift", "standard": "SKKNI"},
        {"code": "B.05OFL00.005.1", "name": "Melakukan Penataan Barang di Rak (Racking)", "standard": "SKKNI"},
        {"code": "B.05OFL00.006.1", "name": "Menerapkan Prosedur Parkir dan Keselamatan Forklift", "standard": "SKKNI"}
    ]'::jsonb,
    'active'
)
ON CONFLICT (code) DO NOTHING;
