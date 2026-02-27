import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

export async function PUT(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const { id } = await params;
        const { nama, no_registrasi, bidang, status } = await request.json();
        if (!nama?.trim())
            return NextResponse.json({ error: 'Nama asesor wajib diisi' }, { status: 400 });

        const result = await query(
            `UPDATE asesor SET nama=$1, no_registrasi=$2, bidang=$3, status=$4
             WHERE id=$5 RETURNING *`,
            [nama.trim(), no_registrasi || null, bidang || 'Alat Angkat dan Angkut', status || 'Aktif', id]
        );
        if (!result.rows.length)
            return NextResponse.json({ error: 'Asesor tidak ditemukan' }, { status: 404 });

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengupdate asesor' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const { id } = await params;
        const result = await query('DELETE FROM asesor WHERE id=$1 RETURNING id', [id]);
        if (!result.rows.length)
            return NextResponse.json({ error: 'Asesor tidak ditemukan' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Asesor dihapus' });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal menghapus asesor' }, { status: 500 });
    }
}
