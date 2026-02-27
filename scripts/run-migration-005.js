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
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('Connected!\n');

        const migrationFile = path.join(__dirname, '../database/migrations/005_create_asesi_profiles.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        console.log('Running migration: 005_create_asesi_profiles.sql');
        await client.query(sql);

        console.log('Migration completed successfully!');
        console.log('Created: asesi_profiles table');

        client.release();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

runMigration();
