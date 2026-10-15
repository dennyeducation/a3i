import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// GET /api/admin/organisasi — daftar seluruh anggota struktur organisasi
export async function GET(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    try {
        const result = await query(
            `SELECT * FROM organization_members ORDER BY level ASC, display_order ASC, id ASC`
        );
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Gagal mengambil data struktur organisasi' }, { status: 500 });
    }
}

// POST /api/admin/organisasi — tambah anggota struktur organisasi
export async function POST(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    try {
        const body = await request.json();
        const { name, position, level, display_order, photo } = body;

        if (!name || !position) {
            return NextResponse.json({ error: 'Nama dan jabatan wajib diisi' }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO organization_members (name, position, level, display_order, photo)
             VALUES ($1,$2,$3,$4,$5)
             RETURNING *`,
            [
                name.trim(),
                position.trim(),
                parseInt(level) || 3,
                parseInt(display_order) || 0,
                photo || null,
            ]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Gagal menambahkan anggota struktur organisasi' }, { status: 500 });
    }
}
