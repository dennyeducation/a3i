import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

async function run() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        const client = await pool.connect();
        console.log('Connected!');
        const sql = fs.readFileSync(path.join(__dirname, '../database/migrations/010_add_registration_form_no_to_certifications.sql'), 'utf8');
        await client.query(sql);
        console.log('Migration 010 completed! registration_no and form_no added to certifications.');
        client.release();
        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e.message);
        await pool.end();
        process.exit(1);
    }
}
run();
