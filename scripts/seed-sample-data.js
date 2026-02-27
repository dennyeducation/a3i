import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function seedSampleData() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔌 Connecting to database...');
        const client = await pool.connect();
        console.log('✅ Connected successfully!\n');

        console.log('📊 Inserting sample data...');
        console.log('─'.repeat(60));

        // Get first user (or you can specify user_id)
        const userResult = await client.query('SELECT id, username FROM users ORDER BY id LIMIT 1');

        if (userResult.rows.length === 0) {
            console.log('❌ No users found. Please register a user first.');
            client.release();
            await pool.end();
            process.exit(1);
        }

        const userId = userResult.rows[0].id;
        const username = userResult.rows[0].username;
        console.log(`👤 Using user: ${username} (ID: ${userId})\n`);

        // Insert sample certifications
        console.log('📜 Inserting certifications...');
        await client.query(`
            INSERT INTO certifications (user_id, certification_name, certification_type, certification_number, status, issued_date, expiry_date, score)
            VALUES
                ($1, 'Junior Web Developer', 'Web Development', 'CERT-JWD-2024-001', 'active', '2024-01-15', '2027-01-15', 85.5),
                ($1, 'Graphic Designer', 'Design', 'CERT-GD-2023-042', 'active', '2023-06-20', '2026-06-20', 92.0),
                ($1, 'Data Analyst', 'Data Science', 'CERT-DA-2024-015', 'pending', NULL, NULL, NULL)
            ON CONFLICT DO NOTHING
        `, [userId]);
        console.log('  ✓ 3 certifications added');

        // Insert sample applications
        console.log('📝 Inserting applications...');
        await client.query(`
            INSERT INTO applications (user_id, certification_type, status, application_date, documents)
            VALUES
                ($1, 'Senior Web Developer', 'reviewing', NOW() - INTERVAL '3 days', '{"resume": "resume.pdf", "portfolio": "https://portfolio.example.com"}'),
                ($1, 'UI/UX Designer', 'submitted', NOW() - INTERVAL '1 day', '{"resume": "resume.pdf", "certificates": ["cert1.pdf"]}'),
                ($1, 'Full Stack Developer', 'approved', NOW() - INTERVAL '7 days', '{"resume": "resume.pdf"}')
            ON CONFLICT DO NOTHING
        `, [userId]);
        console.log('  ✓ 3 applications added');

        // Get application IDs for assessments
        const appResult = await client.query(
            'SELECT id FROM applications WHERE user_id = $1 ORDER BY id LIMIT 2',
            [userId]
        );

        if (appResult.rows.length > 0) {
            // Insert sample assessments
            console.log('📅 Inserting assessments...');
            await client.query(`
                INSERT INTO assessments (application_id, user_id, assessment_type, scheduled_date, location, status)
                VALUES
                    ($1, $2, 'practical', NOW() + INTERVAL '5 days', 'LSP A3I - Jakarta', 'scheduled'),
                    ($3, $2, 'written', NOW() + INTERVAL '10 days', 'LSP A3I - Jakarta', 'scheduled')
                ON CONFLICT DO NOTHING
            `, [appResult.rows[0].id, userId, appResult.rows[1]?.id || appResult.rows[0].id]);
            console.log('  ✓ 2 assessments added');
        }

        // Insert sample activities
        console.log('📋 Inserting activities...');
        await client.query(`
            INSERT INTO activities (user_id, activity_type, title, description, metadata)
            VALUES
                ($1, 'login', 'Login Berhasil', 'Anda berhasil login ke sistem LSP A3I', '{"ip": "127.0.0.1"}'),
                ($1, 'application_submitted', 'Pendaftaran Sertifikasi Baru', 'Mendaftar sertifikasi Senior Web Developer', '{"certification": "Senior Web Developer"}'),
                ($1, 'assessment_scheduled', 'Asesmen Dijadwalkan', 'Asesmen praktis dijadwalkan untuk 5 hari ke depan', '{"type": "practical", "date": "2024-03-01"}'),
                ($1, 'certificate_issued', 'Sertifikat Diterbitkan', 'Sertifikat Junior Web Developer telah diterbitkan', '{"cert_number": "CERT-JWD-2024-001"}'),
                ($1, 'profile_updated', 'Profil Diperbarui', 'Informasi profil Anda telah diperbarui', NULL),
                ($1, 'document_uploaded', 'Dokumen Diunggah', 'Dokumen resume.pdf berhasil diunggah', '{"filename": "resume.pdf"}'),
                ($1, 'application_approved', 'Pendaftaran Disetujui', 'Pendaftaran Full Stack Developer telah disetujui', '{"certification": "Full Stack Developer"}'),
                ($1, 'login', 'Login dari Perangkat Baru', 'Login dari perangkat baru terdeteksi', '{"device": "Chrome/Windows"}')
            ON CONFLICT DO NOTHING
        `, [userId]);
        console.log('  ✓ 8 activities added');

        client.release();
        await pool.end();

        console.log('\n✅ Sample data seeded successfully!');
        console.log('\n📊 Summary:');
        console.log('  • 3 Certifications');
        console.log('  • 3 Applications');
        console.log('  • 2 Assessments');
        console.log('  • 8 Activities');
        console.log(`\n🎯 User: ${username} (ID: ${userId})`);
        console.log('\n🚀 You can now test the dashboard at http://localhost:3000/dashboard');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:');
        console.error(error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
        await pool.end();
        process.exit(1);
    }
}

seedSampleData();
