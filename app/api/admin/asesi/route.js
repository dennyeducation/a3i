import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/admin/asesi — list asesi dengan profil
export async function GET(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const { searchParams } = new URL(request.url);
        const page   = parseInt(searchParams.get('page')  || '1');
        const limit  = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        const conds  = ["u.role = 'ASESI'"];
        const params = [];
        let   idx    = 1;

        if (search) {
            conds.push(`(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx}
                         OR ap.perusahaan ILIKE $${idx} OR ap.no_identitas ILIKE $${idx})`);
            params.push(`%${search}%`);
            idx++;
        }

        const where = `WHERE ${conds.join(' AND ')}`;

        const base = `
            FROM users u
            LEFT JOIN asesi_profiles ap ON ap.user_id = u.id
            ${where}`;

        const [rows, countRow] = await Promise.all([
            query(`SELECT
                    u.id, u.username, u.email, u.full_name, u.is_active, u.created_at,
                    ap.no_identitas, ap.jenis_kelamin, ap.tanggal_lahir,
                    ap.tingkat_pendidikan, ap.alamat, ap.no_whatsapp, ap.perusahaan, ap.photo,
                    (SELECT COUNT(*) FROM certifications c WHERE c.user_id = u.id AND c.status = 'active') AS sertifikat_aktif,
                    (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id AND a.status NOT IN ('completed','rejected')) AS pendaftaran_aktif
                   ${base}
                   ORDER BY u.created_at DESC
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
        return NextResponse.json({ error: 'Gagal mengambil data asesi' }, { status: 500 });
    }
}

// POST /api/admin/asesi — buat asesi baru (user + profil)
export async function POST(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const body = await request.json();
        const {
            username, email, full_name, password,
            no_identitas, jenis_kelamin, tanggal_lahir, tingkat_pendidikan,
            alamat, no_whatsapp, perusahaan, photo,
        } = body;

        if (!full_name || !email)
            return NextResponse.json({ error: 'Nama lengkap dan email wajib diisi' }, { status: 400 });

        // Buat username dari email jika tidak diisi
        const uname = username || email.split('@')[0];

        // Hash password
        const pwd = password || 'Asesi@123';
        const hashed = await bcrypt.hash(pwd, 12);

        // Insert user
        let userRow;
        try {
            const r = await query(
                `INSERT INTO users (username, email, full_name, password, role, is_active)
                 VALUES ($1, $2, $3, $4, 'ASESI', true)
                 RETURNING id, username, email, full_name, role, is_active, created_at`,
                [uname, email, full_name, hashed]
            );
            userRow = r.rows[0];
        } catch (err) {
            if (err.code === '23505')
                return NextResponse.json({ error: 'Email atau username sudah terdaftar' }, { status: 409 });
            throw err;
        }

        // Insert profil
        const profil = await query(
            `INSERT INTO asesi_profiles
                (user_id, no_identitas, jenis_kelamin, tanggal_lahir, tingkat_pendidikan, alamat, no_whatsapp, perusahaan, photo)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             RETURNING *`,
            [userRow.id, no_identitas || null, jenis_kelamin || null,
             tanggal_lahir || null, tingkat_pendidikan || null,
             alamat || null, no_whatsapp || null, perusahaan || null, photo || null]
        );

        return NextResponse.json({
            success: true,
            data: { ...userRow, ...profil.rows[0] },
        }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal membuat asesi' }, { status: 500 });
    }
}
