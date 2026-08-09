import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/certificates/verify?number=... - Public certificate verification by
// certification number, registration number, or form/blank number.
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const number = (searchParams.get('number') || '').trim();

        if (!number) {
            return NextResponse.json(
                { error: 'Nomor sertifikat wajib diisi' },
                { status: 400 }
            );
        }

        // Ignore spaces and dashes so "12345 / LSP-A3I / 2024" matches "12345/LSP/A3I/2024"
        const normalized = number.replace(/[\s-]/g, '');

        const result = await query(
            `SELECT
                c.certification_number,
                c.registration_no,
                c.form_no,
                c.certification_name,
                c.certification_type,
                c.status,
                c.issued_date,
                c.expiry_date,
                COALESCE(c.full_name, u.full_name, u.username) AS full_name,
                cs.name AS scheme_name,
                cs.code AS scheme_code
            FROM certifications c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN certification_schemes cs ON c.scheme_id = cs.id
            WHERE
                regexp_replace(c.certification_number, '[\\s-]', '', 'g') ILIKE $1 OR
                regexp_replace(c.registration_no, '[\\s-]', '', 'g') ILIKE $1 OR
                regexp_replace(c.form_no, '[\\s-]', '', 'g') ILIKE $1
            LIMIT 1`,
            [normalized]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: true, found: false },
                { status: 200 }
            );
        }

        return NextResponse.json({
            success: true,
            found: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        return NextResponse.json(
            { error: 'Gagal memeriksa sertifikat' },
            { status: 500 }
        );
    }
}
