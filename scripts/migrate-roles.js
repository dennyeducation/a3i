/**
 * Migration script untuk update user roles
 * Menjalankan migration dari sistem role lama ke sistem role baru
 *
 * Usage:
 * node scripts/migrate-roles.js
 */

import { query } from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';

async function migrateRoles() {
    console.log('🔄 Starting role migration...\n');

    try {
        // 1. Update existing roles
        console.log('📝 Updating existing user roles...');
        const updateResult = await query(`
            UPDATE users
            SET role = CASE
                WHEN role = 'user' THEN 'ASESI'
                WHEN role = 'admin' THEN 'ADMIN'
                WHEN role = 'asesor' THEN 'ASESOR'
                ELSE 'ASESI'
            END
        `);
        console.log(`✅ Updated ${updateResult.rowCount} users\n`);

        // 2. Show current role distribution
        console.log('📊 Current role distribution:');
        const distribution = await query(`
            SELECT role, COUNT(*) as count
            FROM users
            GROUP BY role
            ORDER BY role
        `);
        distribution.rows.forEach(row => {
            console.log(`   ${row.role}: ${row.count} users`);
        });
        console.log('');

        // 3. Check if SUPERADMIN exists
        const superAdminCheck = await query(
            `SELECT id, username, email FROM users WHERE role = 'SUPERADMIN'`
        );

        if (superAdminCheck.rows.length === 0) {
            console.log('⚠️  No SUPERADMIN user found!');
            console.log('💡 Creating default SUPERADMIN...');

            // Create default SUPERADMIN
            const defaultPassword = 'Admin@2024'; // CHANGE THIS!
            const hashedPassword = await hashPassword(defaultPassword);

            const newSuperAdmin = await query(
                `INSERT INTO users (username, email, password, full_name, role, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, username, email, role`,
                ['superadmin', 'superadmin@lsp-a3i.com', hashedPassword, 'Super Administrator', 'SUPERADMIN', true]
            );

            console.log('✅ SUPERADMIN created successfully:');
            console.log(`   Email: ${newSuperAdmin.rows[0].email}`);
            console.log(`   Username: ${newSuperAdmin.rows[0].username}`);
            console.log(`   Password: ${defaultPassword}`);
            console.log('   ⚠️  IMPORTANT: Change this password immediately!\n');
        } else {
            console.log('✅ SUPERADMIN user already exists:');
            superAdminCheck.rows.forEach(admin => {
                console.log(`   - ${admin.username} (${admin.email})`);
            });
            console.log('');
        }

        console.log('✅ Migration completed successfully!\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run migration
migrateRoles()
    .then(() => {
        console.log('👋 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
