import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
    try {
        // Check authentication
        const auth = await requireAuth(request);

        if (!auth.authenticated) {
            return NextResponse.json(
                { error: auth.error || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user details from database
        const result = await query(
            'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = $1',
            [auth.user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        const user = result.rows[0];

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    is_active: user.is_active,
                    created_at: user.created_at,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mengambil data user' },
            { status: 500 }
        );
    }
}
