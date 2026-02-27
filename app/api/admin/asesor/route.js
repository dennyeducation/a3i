import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// GET /api/admin/asesor
export async function GET(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const { searchParams } = new URL(request.url);
        const page   = parseInt(searchParams.get('page')  || '1');
        const limit  = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        const conds  = [];
        const params = [];
        let   idx    = 1;

        if (search) {
            conds.push(`(nama ILIKE $${idx} OR no_registrasi ILIKE $${idx} OR bidang ILIKE $${idx})`);
            params.push(`%${search}%`); idx++;
        }
        if (status && status !== 'Semua') {
            conds.push(`status = $${idx}`); params.push(status); idx++;
        }

        const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

        const [rows, countRow] = await Promise.all([
            query(`SELECT * FROM asesor ${where} ORDER BY id ASC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]),
            query(`SELECT COUNT(*) FROM asesor ${where}`, params),
        ]);

        const total      = parseInt(countRow.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({ success: true, data: rows.rows, pagination: { page, limit, total, totalPages } });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengambil data asesor' }, { status: 500 });
    }
}

// POST /api/admin/asesor
export async function POST(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const { nama, no_registrasi, bidang, status } = await request.json();
        if (!nama?.trim())
            return NextResponse.json({ error: 'Nama asesor wajib diisi' }, { status: 400 });

        const result = await query(
            `INSERT INTO asesor (nama, no_registrasi, bidang, status)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [nama.trim(), no_registrasi || null,
             bidang || 'Alat Angkat dan Angkut', status || 'Aktif']
        );
        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal menambah asesor' }, { status: 500 });
    }
}
