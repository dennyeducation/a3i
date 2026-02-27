import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/admin/asesi/[id] — detail asesi + sertifikat + pendaftaran
export async function GET(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const { id } = params;

        // Data profil
        const profil = await query(
            `SELECT
                u.id, u.username, u.email, u.full_name, u.is_active, u.created_at,
                ap.no_identitas, ap.jenis_kelamin, ap.tanggal_lahir,
                ap.tingkat_pendidikan, ap.alamat, ap.no_whatsapp, ap.perusahaan, ap.photo
             FROM users u
             LEFT JOIN asesi_profiles ap ON ap.user_id = u.id
             WHERE u.id = $1 AND u.role = 'ASESI'`,
            [id]
        );
        if (!profil.rows.length)
            return NextResponse.json({ error: 'Asesi tidak ditemukan' }, { status: 404 });

        // Sertifikat milik asesi
        const sertifikat = await query(
            `SELECT c.id, c.certification_name, c.certification_number, c.status,
                    c.issued_date, c.expiry_date, c.score,
                    cs.name AS scheme_name, cs.code AS scheme_code
             FROM certifications c
             LEFT JOIN certification_schemes cs ON cs.id = c.scheme_id
             WHERE c.user_id = $1
             ORDER BY c.issued_date DESC NULLS LAST`,
            [id]
        );

        // Pendaftaran asesi
        const pendaftaran = await query(
            `SELECT a.id, a.certification_type, a.status, a.application_date,
                    a.review_date, a.notes, a.rejection_reason,
                    cs.name AS scheme_name, cs.code AS scheme_code,
                    rv.full_name AS reviewer_name
             FROM applications a
             LEFT JOIN certification_schemes cs ON cs.id = a.scheme_id
             LEFT JOIN users rv ON rv.id = a.reviewer_id
             WHERE a.user_id = $1
             ORDER BY a.created_at DESC`,
            [id]
        );

        return NextResponse.json({
            success: true,
            data: {
                ...profil.rows[0],
                sertifikat: sertifikat.rows,
                pendaftaran: pendaftaran.rows,
            },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengambil data asesi' }, { status: 500 });
    }
}

// PUT /api/admin/asesi/[id] — update user + profil asesi
export async function PUT(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const { id } = params;
        const body = await request.json();
        const {
            full_name, email, username, is_active, password,
            no_identitas, jenis_kelamin, tanggal_lahir, tingkat_pendidikan,
            alamat, no_whatsapp, perusahaan, photo,
        } = body;

        // Update users table
        const userFields = [];
        const userVals   = [];
        let   ui         = 1;

        if (full_name  !== undefined) { userFields.push(`full_name = $${ui}`);  userVals.push(full_name);  ui++; }
        if (email      !== undefined) { userFields.push(`email = $${ui}`);       userVals.push(email);      ui++; }
        if (username   !== undefined) { userFields.push(`username = $${ui}`);    userVals.push(username);   ui++; }
        if (is_active  !== undefined) { userFields.push(`is_active = $${ui}`);   userVals.push(is_active);  ui++; }
        if (password) {
            const hashed = await bcrypt.hash(password, 12);
            userFields.push(`password = $${ui}`); userVals.push(hashed); ui++;
        }

        if (userFields.length) {
            userVals.push(id);
            await query(
                `UPDATE users SET ${userFields.join(', ')} WHERE id = $${ui} AND role = 'ASESI'`,
                userVals
            );
        }

        // Upsert asesi_profiles
        await query(
            `INSERT INTO asesi_profiles
                (user_id, no_identitas, jenis_kelamin, tanggal_lahir, tingkat_pendidikan, alamat, no_whatsapp, perusahaan, photo)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             ON CONFLICT (user_id) DO UPDATE SET
                no_identitas       = EXCLUDED.no_identitas,
                jenis_kelamin      = EXCLUDED.jenis_kelamin,
                tanggal_lahir      = EXCLUDED.tanggal_lahir,
                tingkat_pendidikan = EXCLUDED.tingkat_pendidikan,
                alamat             = EXCLUDED.alamat,
                no_whatsapp        = EXCLUDED.no_whatsapp,
                perusahaan         = EXCLUDED.perusahaan,
                photo              = EXCLUDED.photo`,
            [id, no_identitas || null, jenis_kelamin || null,
             tanggal_lahir || null, tingkat_pendidikan || null,
             alamat || null, no_whatsapp || null, perusahaan || null, photo || null]
        );

        // Return data terbaru
        const result = await query(
            `SELECT u.id, u.username, u.email, u.full_name, u.is_active,
                    ap.no_identitas, ap.jenis_kelamin, ap.tanggal_lahir,
                    ap.tingkat_pendidikan, ap.alamat, ap.no_whatsapp, ap.perusahaan, ap.photo
             FROM users u
             LEFT JOIN asesi_profiles ap ON ap.user_id = u.id
             WHERE u.id = $1`,
            [id]
        );

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengupdate asesi' }, { status: 500 });
    }
}

// DELETE /api/admin/asesi/[id]
export async function DELETE(request, { params }) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const result = await query(
            "DELETE FROM users WHERE id = $1 AND role = 'ASESI' RETURNING id",
            [params.id]
        );
        if (!result.rows.length)
            return NextResponse.json({ error: 'Asesi tidak ditemukan' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Asesi dihapus' });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal menghapus asesi' }, { status: 500 });
    }
}
