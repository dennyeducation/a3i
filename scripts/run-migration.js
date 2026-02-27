import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function runMigration() {
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

        // Read migration file
        const migrationFile = path.join(__dirname, '../database/migrations/002_create_certification_tables.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        console.log('📄 Running migration: 002_create_certification_tables.sql');
        console.log('─'.repeat(60));

        // Execute migration
        await client.query(sql);

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📊 Created tables:');
        console.log('  ✓ certifications');
        console.log('  ✓ applications');
        console.log('  ✓ assessments');
        console.log('  ✓ activities');
        console.log('  ✓ notification_preferences');
        console.log('\n🎯 Triggers created for auto-update timestamps');

        client.release();
        await pool.end();

        console.log('\n🎉 All done!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:');
        console.error(error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
        await pool.end();
        process.exit(1);
    }
}

runMigration();
