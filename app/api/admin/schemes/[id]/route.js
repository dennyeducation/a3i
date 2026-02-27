import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// GET /api/admin/schemes/[id]
export async function GET(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    try {
        const { id } = await params;
        const result = await query(
            `SELECT cs.*, u.full_name AS created_by_name
             FROM certification_schemes cs
             LEFT JOIN users u ON cs.created_by = u.id
             WHERE cs.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Skema tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Gagal mengambil data skema' }, { status: 500 });
    }
}

// PUT /api/admin/schemes/[id]
export async function PUT(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const allowed = ['name', 'description', 'category', 'level', 'duration_months', 'requirements', 'competency_units', 'status', 'image'];

        const updates = [];
        const values  = [];
        let   idx     = 1;

        for (const field of allowed) {
            if (body[field] !== undefined) {
                updates.push(`${field} = $${idx}`);
                values.push(field === 'competency_units' ? JSON.stringify(body[field]) : body[field]);
                idx++;
            }
        }

        // Tangani perubahan kode (dengan cek duplikat)
        if (body.code !== undefined) {
            const dup = await query(
                'SELECT id FROM certification_schemes WHERE code = $1 AND id != $2',
                [body.code.trim().toUpperCase(), id]
            );
            if (dup.rows.length > 0) {
                return NextResponse.json({ error: 'Kode skema sudah digunakan' }, { status: 400 });
            }
            updates.push(`code = $${idx}`);
            values.push(body.code.trim().toUpperCase());
            idx++;
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });
        }

        values.push(id);
        const result = await query(
            `UPDATE certification_schemes SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Skema tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Gagal mengupdate skema' }, { status: 500 });
    }
}

// DELETE /api/admin/schemes/[id]
export async function DELETE(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    try {
        const { id } = await params;
        const result = await query(
            'DELETE FROM certification_schemes WHERE id = $1 RETURNING id, name',
            [id]
        );
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Skema tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Skema berhasil dihapus' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Gagal menghapus skema' }, { status: 500 });
    }
}
