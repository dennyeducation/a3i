import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
    try {
        const auth = await requireAuth(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await query(
            'UPDATE users SET is_active = false, updated_at = $1 WHERE id = $2',
            [new Date(), auth.user.id]
        );

        return NextResponse.json({ success: true, message: 'Akun berhasil dinonaktifkan' });
    } catch (error) {
        console.error('Deactivate account error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
