import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, isValidEmail, isValidPassword, USER_ROLES } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, email, password, full_name } = body;

        // Validation
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'Username, email, dan password harus diisi' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Format email tidak valid' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (!isValidPassword(password)) {
            return NextResponse.json(
                { error: 'Password minimal 6 karakter' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: 'Email atau username sudah terdaftar' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert new user with default role ASESI
        const result = await query(
            `INSERT INTO users (username, email, password, full_name, role, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, username, email, full_name, role, created_at`,
            [username, email, hashedPassword, full_name || username, USER_ROLES.ASESI, true]
        );

        const newUser = result.rows[0];

        return NextResponse.json(
            {
                success: true,
                message: 'Registrasi berhasil! Silakan login.',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    full_name: newUser.full_name,
                    role: newUser.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.' },
            { status: 500 }
        );
    }
}
