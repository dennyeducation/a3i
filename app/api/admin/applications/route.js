import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// GET /api/admin/applications
export async function GET(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const { searchParams } = new URL(request.url);
        const page   = parseInt(searchParams.get('page')   || '1');
        const limit  = parseInt(searchParams.get('limit')  || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        const conds  = [];
        const params = [];
        let   idx    = 1;

        if (search) {
            conds.push(`(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.username ILIKE $${idx}
                         OR a.applicant_name ILIKE $${idx} OR a.applicant_email ILIKE $${idx}
                         OR cs.name ILIKE $${idx} OR a.certification_type ILIKE $${idx})`);
            params.push(`%${search}%`);
            idx++;
        }
        if (status) {
            conds.push(`a.status = $${idx}`);
            params.push(status);
            idx++;
        }

        const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

        const base = `
            FROM applications a
            LEFT JOIN users u        ON a.user_id    = u.id
            LEFT JOIN users rv       ON a.reviewer_id = rv.id
            LEFT JOIN certification_schemes cs ON a.scheme_id = cs.id
            ${where}`;

        const [rows, countRow] = await Promise.all([
            query(`SELECT
                    a.*,
                    u.username, u.email AS user_email, u.full_name AS user_full_name,
                    rv.full_name AS reviewer_name,
                    cs.name AS scheme_name, cs.code AS scheme_code
                   ${base}
                   ORDER BY a.created_at DESC
                   LIMIT $${idx} OFFSET $${idx + 1}`,
                [...params, limit, offset]),
            query(`SELECT COUNT(*) ${base}`, params),
        ]);

        const total      = parseInt(countRow.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: rows.rows,
            pagination: { page, limit, total, totalPages },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengambil data pendaftaran' }, { status: 500 });
    }
}

// POST /api/admin/applications  — buat pendaftaran manual oleh admin
export async function POST(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const body = await request.json();
        const { user_id, scheme_id, certification_type, applicant_name, applicant_email, applicant_phone, notes } = body;

        if (!user_id && !applicant_name) {
            return NextResponse.json({ error: 'User atau nama pendaftar wajib diisi' }, { status: 400 });
        }

        // Ambil nama skema bila scheme_id diisi tapi certification_type kosong
        let certType = certification_type || '';
        if (!certType && scheme_id) {
            const sc = await query('SELECT name FROM certification_schemes WHERE id = $1', [scheme_id]);
            if (sc.rows.length) certType = sc.rows[0].name;
        }

        const result = await query(
            `INSERT INTO applications
                (user_id, scheme_id, certification_type, applicant_name, applicant_email, applicant_phone, status, notes)
             VALUES ($1,$2,$3,$4,$5,$6,'submitted',$7)
             RETURNING *`,
            [user_id || null, scheme_id || null, certType, applicant_name || null, applicant_email || null, applicant_phone || null, notes || null]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal membuat pendaftaran' }, { status: 500 });
    }
}
