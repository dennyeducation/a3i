import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email dan password harus diisi' },
                { status: 400 }
            );
        }

        // Find user by email or username
        const result = await query(
            'SELECT * FROM users WHERE email = $1 OR username = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return NextResponse.json(
                { error: 'Akun Anda tidak aktif. Hubungi administrator.' },
                { status: 403 }
            );
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        });

        // Update last login (optional)
        await query(
            'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Return user data and token
        return NextResponse.json(
            {
                success: true,
                message: 'Login berhasil!',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat login. Silakan coba lagi.' },
            { status: 500 }
        );
    }
}
