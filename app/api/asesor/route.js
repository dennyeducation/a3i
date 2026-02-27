import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/asesor — public, untuk halaman asesor
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const bidang = searchParams.get('bidang') || '';
        const status = searchParams.get('status') || '';

        const conds  = [];
        const params = [];
        let   idx    = 1;

        if (search) {
            conds.push(`(nama ILIKE $${idx} OR no_registrasi ILIKE $${idx})`);
            params.push(`%${search}%`); idx++;
        }
        if (bidang && bidang !== 'Semua Bidang') {
            conds.push(`bidang = $${idx}`); params.push(bidang); idx++;
        }
        if (status && status !== 'Semua') {
            conds.push(`status = $${idx}`); params.push(status); idx++;
        }

        const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

        const [rows, bidangRows] = await Promise.all([
            query(`SELECT id, nama, no_registrasi, bidang, status FROM asesor ${where} ORDER BY id ASC`, params),
            query(`SELECT DISTINCT bidang FROM asesor ORDER BY bidang ASC`),
        ]);

        return NextResponse.json({
            success: true,
            data: rows.rows,
            bidangList: bidangRows.rows.map(r => r.bidang),
            total: rows.rows.length,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengambil data asesor' }, { status: 500 });
    }
}
