import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// PUT /api/admin/organisasi/[id]
export async function PUT(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const allowed = ['name', 'position', 'level', 'display_order', 'photo'];

        const updates = [];
        const values  = [];
        let   idx     = 1;

        for (const field of allowed) {
            if (body[field] !== undefined) {
                let val = body[field];
                if (field === 'level' || field === 'display_order') val = parseInt(val) || 0;
                if (field === 'name' || field === 'position') val = String(val).trim();
                updates.push(`${field} = $${idx}`);
                values.push(val);
                idx++;
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });
        }

        values.push(id);
        const result = await query(
            `UPDATE organization_members SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Gagal mengupdate anggota struktur organisasi' }, { status: 500 });
    }
}

// DELETE /api/admin/organisasi/[id]
export async function DELETE(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    try {
        const { id } = await params;
        const result = await query(
            'DELETE FROM organization_members WHERE id = $1 RETURNING id, name',
            [id]
        );
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Anggota berhasil dihapus' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Gagal menghapus anggota struktur organisasi' }, { status: 500 });
    }
}
