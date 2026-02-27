import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// GET /api/admin/applications/[id]
export async function GET(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const result = await query(
            `SELECT a.*,
                    u.username, u.email AS user_email, u.full_name AS user_full_name,
                    rv.full_name AS reviewer_name,
                    cs.name AS scheme_name, cs.code AS scheme_code
             FROM applications a
             LEFT JOIN users u        ON a.user_id     = u.id
             LEFT JOIN users rv       ON a.reviewer_id = rv.id
             LEFT JOIN certification_schemes cs ON a.scheme_id = cs.id
             WHERE a.id = $1`,
            [params.id]
        );
        if (!result.rows.length)
            return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
    }
}

// PUT /api/admin/applications/[id]  — update status / review
export async function PUT(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const body    = await request.json();
        const allowed = ['status', 'notes', 'rejection_reason', 'scheme_id', 'certification_type',
                         'applicant_name', 'applicant_email', 'applicant_phone'];

        const updates = [];
        const values  = [];
        let   idx     = 1;

        for (const f of allowed) {
            if (body[f] !== undefined) {
                updates.push(`${f} = $${idx}`);
                values.push(body[f]);
                idx++;
            }
        }

        // Set reviewer dan review_date otomatis saat status berubah ke reviewing/approved/rejected
        if (body.status && ['reviewing', 'approved', 'rejected', 'completed'].includes(body.status)) {
            updates.push(`reviewer_id = $${idx}`, `review_date = CURRENT_TIMESTAMP`);
            values.push(auth.user.id);
            idx++;
        }

        if (!updates.length)
            return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });

        values.push(params.id);
        const result = await query(
            `UPDATE applications SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );

        if (!result.rows.length)
            return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengupdate pendaftaran' }, { status: 500 });
    }
}

// DELETE /api/admin/applications/[id]
export async function DELETE(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const result = await query(
            'DELETE FROM applications WHERE id = $1 RETURNING id', [params.id]
        );
        if (!result.rows.length)
            return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Pendaftaran dihapus' });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal menghapus pendaftaran' }, { status: 500 });
    }
}
