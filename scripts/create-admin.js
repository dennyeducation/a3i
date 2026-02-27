/**
 * Script untuk membuat admin user pertama
 * Usage: node scripts/create-admin.js
 */

import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Create a connection pool to the database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function createAdmin() {
    console.log('\n=================================');
    console.log('  CREATE ADMIN USER - LSP A3I');
    console.log('=================================\n');

    try {
        // Get admin details
        const username = await question('Username: ');
        const email = await question('Email: ');
        const fullName = await question('Full Name: ');
        const password = await question('Password (min 6 chars): ');

        // Validate input
        if (!username || !email || !password) {
            console.error('\n❌ Error: Username, email, and password are required!');
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('\n❌ Error: Password must be at least 6 characters!');
            process.exit(1);
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            console.error('\n❌ Error: Username or email already exists!');
            process.exit(1);
        }

        // Hash password
        console.log('\n⏳ Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert admin user
        console.log('⏳ Creating admin user...');
        const result = await pool.query(
            `INSERT INTO users (username, email, password, full_name, role, is_active)
             VALUES ($1, $2, $3, $4, 'admin', true)
             RETURNING id, username, email, full_name, role, created_at`,
            [username, email, hashedPassword, fullName || null]
        );

        console.log('\n✅ Admin user created successfully!\n');
        console.log('Details:');
        console.log('--------');
        console.log(`ID:       ${result.rows[0].id}`);
        console.log(`Username: ${result.rows[0].username}`);
        console.log(`Email:    ${result.rows[0].email}`);
        console.log(`Name:     ${result.rows[0].full_name || 'N/A'}`);
        console.log(`Role:     ${result.rows[0].role}`);
        console.log(`Created:  ${result.rows[0].created_at}`);
        console.log('\n✨ You can now login with these credentials at /login\n');

    } catch (error) {
        console.error('\n❌ Error creating admin:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await pool.end();
    }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set!');
    console.log('Please set DATABASE_URL in your .env file');
    process.exit(1);
}

createAdmin();
