import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/sertifikasi — publik, hanya skema aktif
export async function GET() {
    try {
        const rows = await query(
            `SELECT id, name, category, level, image, code
             FROM certification_schemes
             WHERE status = 'active'
             ORDER BY id ASC`
        );
        return NextResponse.json({ success: true, data: rows.rows });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengambil data skema' }, { status: 500 });
    }
}
