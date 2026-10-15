import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/organisasi — publik, struktur organisasi untuk halaman Profil
export async function GET() {
    try {
        const rows = await query(
            `SELECT id, name, position, level, display_order, photo
             FROM organization_members
             ORDER BY level ASC, display_order ASC, id ASC`
        );
        return NextResponse.json({ success: true, data: rows.rows });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengambil data struktur organisasi' }, { status: 500 });
    }
}
