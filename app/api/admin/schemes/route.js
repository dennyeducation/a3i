import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// GET /api/admin/schemes — list dengan search, status filter, pagination
export async function GET(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page   = parseInt(searchParams.get('page')   || '1');
        const limit  = parseInt(searchParams.get('limit')  || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        const conditions = [];
        const params     = [];
        let   idx        = 1;

        if (search) {
            conditions.push(`(name ILIKE $${idx} OR code ILIKE $${idx} OR category ILIKE $${idx})`);
            params.push(`%${search}%`);
            idx++;
        }
        if (status) {
            conditions.push(`status = $${idx}`);
            params.push(status);
            idx++;
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [rows, countRows] = await Promise.all([
            query(
                `SELECT cs.*, u.full_name AS created_by_name
                 FROM certification_schemes cs
                 LEFT JOIN users u ON cs.created_by = u.id
                 ${where}
                 ORDER BY cs.created_at DESC
                 LIMIT $${idx} OFFSET $${idx + 1}`,
                [...params, limit, offset]
            ),
            query(`SELECT COUNT(*) FROM certification_schemes ${where}`, params),
        ]);

        const total      = parseInt(countRows.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: rows.rows,
            pagination: { page, limit, total, totalPages },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Gagal mengambil data skema' }, { status: 500 });
    }
}

// POST /api/admin/schemes — buat skema baru
export async function POST(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    try {
        const body = await request.json();
        const { code, name, description, category, level, duration_months, requirements, competency_units, status } = body;

        if (!code || !name) {
            return NextResponse.json({ error: 'Kode dan nama skema wajib diisi' }, { status: 400 });
        }

        // Cek duplikat kode
        const dup = await query('SELECT id FROM certification_schemes WHERE code = $1', [code]);
        if (dup.rows.length > 0) {
            return NextResponse.json({ error: 'Kode skema sudah digunakan' }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO certification_schemes
                (code, name, description, category, level, duration_months, requirements, competency_units, status, created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             RETURNING *`,
            [
                code.trim().toUpperCase(),
                name.trim(),
                description || null,
                category || null,
                level || null,
                duration_months || 36,
                requirements || null,
                JSON.stringify(competency_units || []),
                status || 'draft',
                auth.user.id,
            ]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Gagal membuat skema' }, { status: 500 });
    }
}
