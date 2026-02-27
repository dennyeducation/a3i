/**
 * Seed script untuk membuat dummy users untuk setiap role
 * Usage: node scripts/seed-users.js
 */

import { query } from '../lib/db.js';
import { hashPassword, USER_ROLES } from '../lib/auth.js';

const dummyUsers = [
    {
        username: 'superadmin',
        email: 'superadmin@lsp-a3i.com',
        password: 'Super@2024',
        full_name: 'Super Administrator',
        role: USER_ROLES.SUPERADMIN
    },
    {
        username: 'admin1',
        email: 'admin1@lsp-a3i.com',
        password: 'Admin@2024',
        full_name: 'Admin Pertama',
        role: USER_ROLES.ADMIN
    },
    {
        username: 'admin2',
        email: 'admin2@lsp-a3i.com',
        password: 'Admin@2024',
        full_name: 'Admin Kedua',
        role: USER_ROLES.ADMIN
    },
    {
        username: 'asesor1',
        email: 'asesor1@lsp-a3i.com',
        password: 'Asesor@2024',
        full_name: 'Asesor Pertama',
        role: USER_ROLES.ASESOR
    },
    {
        username: 'asesor2',
        email: 'asesor2@lsp-a3i.com',
        password: 'Asesor@2024',
        full_name: 'Asesor Kedua',
        role: USER_ROLES.ASESOR
    },
    {
        username: 'asesor3',
        email: 'asesor3@lsp-a3i.com',
        password: 'Asesor@2024',
        full_name: 'Asesor Ketiga',
        role: USER_ROLES.ASESOR
    },
    {
        username: 'asesi1',
        email: 'asesi1@lsp-a3i.com',
        password: 'Asesi@2024',
        full_name: 'Asesi Pertama',
        role: USER_ROLES.ASESI
    },
    {
        username: 'asesi2',
        email: 'asesi2@lsp-a3i.com',
        password: 'Asesi@2024',
        full_name: 'Asesi Kedua',
        role: USER_ROLES.ASESI
    },
    {
        username: 'asesi3',
        email: 'asesi3@lsp-a3i.com',
        password: 'Asesi@2024',
        full_name: 'Asesi Ketiga',
        role: USER_ROLES.ASESI
    },
    {
        username: 'asesi4',
        email: 'asesi4@lsp-a3i.com',
        password: 'Asesi@2024',
        full_name: 'Asesi Keempat',
        role: USER_ROLES.ASESI
    },
    {
        username: 'asesi5',
        email: 'asesi5@lsp-a3i.com',
        password: 'Asesi@2024',
        full_name: 'Asesi Kelima',
        role: USER_ROLES.ASESI
    }
];

async function seedUsers() {
    console.log('🌱 Starting user seeding...\n');

    let created = 0;
    let skipped = 0;
    const credentials = [];

    for (const user of dummyUsers) {
        try {
            // Check if user already exists
            const existing = await query(
                'SELECT id FROM users WHERE email = $1 OR username = $2',
                [user.email, user.username]
            );

            if (existing.rows.length > 0) {
                console.log(`⏭️  Skipping ${user.username} (already exists)`);
                skipped++;
                continue;
            }

            // Hash password
            const hashedPassword = await hashPassword(user.password);

            // Insert user
            const result = await query(
                `INSERT INTO users (username, email, password, full_name, role, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, username, email, role`,
                [user.username, user.email, hashedPassword, user.full_name, user.role, true]
            );

            console.log(`✅ Created ${user.role.padEnd(12)} - ${user.username}`);
            created++;

            // Store credentials for display later
            credentials.push({
                role: user.role,
                username: user.username,
                email: user.email,
                password: user.password
            });

        } catch (error) {
            console.error(`❌ Failed to create ${user.username}:`, error.message);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 Seeding Summary');
    console.log('='.repeat(70));
    console.log(`✅ Created: ${created} users`);
    console.log(`⏭️  Skipped: ${skipped} users (already exist)`);
    console.log('');

    if (credentials.length > 0) {
        console.log('🔑 Login Credentials for Created Users:');
        console.log('='.repeat(70));

        // Group by role
        const roleGroups = {
            SUPERADMIN: [],
            ADMIN: [],
            ASESOR: [],
            ASESI: []
        };

        credentials.forEach(cred => {
            roleGroups[cred.role].push(cred);
        });

        // Display grouped by role
        Object.entries(roleGroups).forEach(([role, users]) => {
            if (users.length > 0) {
                console.log(`\n📌 ${role}:`);
                users.forEach(u => {
                    console.log(`   Email:    ${u.email}`);
                    console.log(`   Username: ${u.username}`);
                    console.log(`   Password: ${u.password}`);
                    console.log('   ---');
                });
            }
        });

        console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
        console.log('   1. Change all default passwords immediately in production!');
        console.log('   2. These are dummy accounts for development only');
        console.log('   3. Never commit passwords to version control');
        console.log('   4. Use strong, unique passwords in production');
    }

    console.log('\n' + '='.repeat(70));

    // Show final user distribution
    const distribution = await query(`
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
        ORDER BY
            CASE role
                WHEN 'SUPERADMIN' THEN 1
                WHEN 'ADMIN' THEN 2
                WHEN 'ASESOR' THEN 3
                WHEN 'ASESI' THEN 4
            END
    `);

    console.log('\n📊 Current User Distribution:');
    console.log('='.repeat(70));
    distribution.rows.forEach(row => {
        const bar = '█'.repeat(Math.min(row.count, 50));
        console.log(`   ${row.role.padEnd(12)} : ${row.count.toString().padStart(3)} users ${bar}`);
    });
    console.log('');
}

// Run seeding
seedUsers()
    .then(() => {
        console.log('✅ Seeding completed successfully!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    });
