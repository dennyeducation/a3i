-- Migration 006: Create asesor table
-- Created: 2026-02-27
-- Description: Tabel daftar asesor kompetensi LSP A3I

CREATE TABLE IF NOT EXISTS asesor (
    id            SERIAL PRIMARY KEY,
    nama          VARCHAR(200) NOT NULL,
    no_registrasi VARCHAR(100),
    bidang        VARCHAR(200) DEFAULT 'Alat Angkat dan Angkut',
    status        VARCHAR(20)  DEFAULT 'Aktif'
                  CHECK (status IN ('Aktif', 'Tidak Aktif')),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asesor_status ON asesor(status);
CREATE INDEX IF NOT EXISTS idx_asesor_nama   ON asesor(nama);

DROP TRIGGER IF EXISTS update_asesor_updated_at ON asesor;
CREATE TRIGGER update_asesor_updated_at
    BEFORE UPDATE ON asesor
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Data 26 asesor
INSERT INTO asesor (nama, no_registrasi, bidang, status) VALUES
('Kusnanto',                      'MET.000.000008 2006', 'Alat Angkat dan Angkut', 'Aktif'),
('Ahmat Asrul Darus',             'MET.000.002091 2017', 'Alat Angkat dan Angkut', 'Aktif'),
('Junaidi',                       'MET.000.003026 2021', 'Alat Angkat dan Angkut', 'Aktif'),
('Maryanto',                      'MET.000.004764 2017', 'Alat Angkat dan Angkut', 'Aktif'),
('Adhy Kusumo Prabowo',           'MET.000.000086 2021', 'Alat Angkat dan Angkut', 'Aktif'),
('Afrida Fadillah Junaedi',       'MET.000.003007 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Akmal Ahmad',                   'MET.000.003016 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Aziz Asmauna',                  'MET.000.003004 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Bayu Baroto Yuwono',            'MET.000.003012 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Boy Putra Anggara Prasetyo',    'MET.000.003009 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Budiarto',                      'MET.000.000968 2021', 'Alat Angkat dan Angkut', 'Aktif'),
('Chandra Yuliadi Hatmoko',       'MET.000.003003 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Djoko Laras',                   'MET.000.003020 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Haris Wafi Auzan',              'MET.000.003006 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Ia Kurniawan',                  'MET.000.003014 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Irsad',                         'MET.000.003005 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Lukman Hakim',                  'MET.000.003015 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Muhammad Ichsan',               'MET.000.003011 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Muhammad Kasiyyanto Assahid',   'MET.000.003013 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Musryanto',                     'MET.000.003018 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Nasaruddin',                    'MET.000.003017 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Nindya Bayu Narotama',          'MET.000.003008 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Salamuddin',                    'MET.000.003010 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Solikin',                       'MET.000.000802 2009', 'Alat Angkat dan Angkut', 'Aktif'),
('Supahing',                      'MET.000.003021 2024', 'Alat Angkat dan Angkut', 'Aktif'),
('Wiji Lestari',                  'MET.000.003019 2024', 'Alat Angkat dan Angkut', 'Aktif')
ON CONFLICT DO NOTHING;
