import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    const client = await pool.connect();

    try {
        console.log('🔄 Connecting to database...');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        console.log('📋 Executing schema...');

        // Execute schema
        await client.query(schema);

        console.log('✅ Database schema created successfully!');
        console.log('');
        console.log('Tables created:');
        console.log('  - users');
        console.log('  - sessions');
        console.log('');
        console.log('You can now register and login to the application.');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run setup
setupDatabase()
    .then(() => {
        console.log('✨ Setup completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
