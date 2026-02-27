-- Migration script untuk update user roles dari sistem lama ke sistem baru
-- Jalankan script ini untuk mengupdate existing data

-- Backup data existing users (optional, untuk safety)
-- CREATE TABLE users_backup AS SELECT * FROM users;

-- Update role column untuk mengubah nilai lama ke nilai baru
-- 'user' -> 'ASESI' (default role untuk public registration)
-- 'admin' -> 'ADMIN' (administrative access)
-- 'asesor' -> 'ASESOR' (assessor access)

UPDATE users
SET role = CASE
    WHEN role = 'user' THEN 'ASESI'
    WHEN role = 'admin' THEN 'ADMIN'
    WHEN role = 'asesor' THEN 'ASESOR'
    ELSE 'ASESI'  -- default untuk role yang tidak dikenali
END;

-- Optional: Create first SUPERADMIN user (ganti dengan data yang sesuai)
-- UPDATE users SET role = 'SUPERADMIN' WHERE email = 'superadmin@lsp-a3i.com';

-- Atau insert SUPERADMIN baru (ganti password_hash dengan hasil hash password)
-- INSERT INTO users (username, email, password, full_name, role, is_active)
-- VALUES ('superadmin', 'superadmin@lsp-a3i.com', '$2a$10$...', 'Super Administrator', 'SUPERADMIN', true);

-- Verify hasil migration
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;
