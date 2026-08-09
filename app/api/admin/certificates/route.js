import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole, USER_ROLES } from '@/lib/auth';

// GET /api/admin/certificates - Get all certificates with filters
export async function GET(request) {
    // Check if user is admin
    const auth = await requireRole(request, USER_ROLES.ADMIN);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.error === 'Unauthorized' ? 401 : 403 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';

        // Build query
        let whereClause = '';
        const params = [];
        let paramIndex = 1;

        if (search) {
            // Ignore spaces and dashes so e.g. "123 45-LSP" matches "12345/LSP"
            const normalizedSearch = search.replace(/[\s-]/g, '');

            whereClause = `WHERE (
                c.certification_name ILIKE $${paramIndex} OR
                c.certification_type ILIKE $${paramIndex} OR
                c.certification_number ILIKE $${paramIndex} OR
                c.registration_no ILIKE $${paramIndex} OR
                c.form_no ILIKE $${paramIndex} OR
                c.full_name ILIKE $${paramIndex} OR
                u.username ILIKE $${paramIndex} OR
                u.full_name ILIKE $${paramIndex} OR
                u.email ILIKE $${paramIndex} OR
                cs.name ILIKE $${paramIndex} OR
                cs.code ILIKE $${paramIndex} OR
                regexp_replace(c.certification_number, '[\\s-]', '', 'g') ILIKE $${paramIndex + 1} OR
                regexp_replace(c.registration_no, '[\\s-]', '', 'g') ILIKE $${paramIndex + 1} OR
                regexp_replace(c.form_no, '[\\s-]', '', 'g') ILIKE $${paramIndex + 1}
            )`;
            params.push(`%${search}%`, `%${normalizedSearch}%`);
            paramIndex += 2;
        }

        if (status) {
            whereClause += whereClause ? ' AND ' : 'WHERE ';
            whereClause += `c.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM certifications c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN certification_schemes cs ON c.scheme_id = cs.id
            ${whereClause}
        `;
        const countResult = await query(countQuery, params);
        const totalCertificates = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalCertificates / limit);

        // Get certificates with pagination
        const certificatesQuery = `
            SELECT
                c.*,
                u.username,
                u.email,
                u.full_name as user_full_name,
                cs.name as scheme_name,
                cs.code as scheme_code
            FROM certifications c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN certification_schemes cs ON c.scheme_id = cs.id
            ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(limit, offset);

        const result = await query(certificatesQuery, params);

        return NextResponse.json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                totalCertificates,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch certificates' },
            { status: 500 }
        );
    }
}

// POST /api/admin/certificates - Create new certificate
export async function POST(request) {
    // Check if user is admin
    const auth = await requireRole(request, USER_ROLES.ADMIN);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.error === 'Unauthorized' ? 401 : 403 }
        );
    }

    try {
        const body = await request.json();
        const {
            user_id,
            scheme_id,
            certification_name,
            certification_type,
            certification_number,
            registration_no,
            form_no,
            full_name,
            status,
            issued_date,
            expiry_date,
            score
        } = body;

        // Validation
        if (!user_id || !certification_name || !certification_type) {
            return NextResponse.json(
                { error: 'User ID, certification name, and type are required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const userCheck = await query(
            'SELECT id FROM users WHERE id = $1',
            [user_id]
        );

        if (userCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if scheme exists (if provided)
        if (scheme_id) {
            const schemeCheck = await query(
                'SELECT id FROM certification_schemes WHERE id = $1',
                [scheme_id]
            );

            if (schemeCheck.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Skema sertifikasi tidak ditemukan' },
                    { status: 404 }
                );
            }
        }

        // Check if certification number is unique (if provided)
        if (certification_number) {
            const certCheck = await query(
                'SELECT id FROM certifications WHERE certification_number = $1',
                [certification_number]
            );

            if (certCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: 'Certification number already exists' },
                    { status: 400 }
                );
            }
        }

        // Check if registration number is unique (if provided)
        if (registration_no) {
            const regCheck = await query(
                'SELECT id FROM certifications WHERE registration_no = $1',
                [registration_no]
            );

            if (regCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: 'Nomor registrasi sudah digunakan' },
                    { status: 400 }
                );
            }
        }

        // Check if form number is unique (if provided)
        if (form_no) {
            const formCheck = await query(
                'SELECT id FROM certifications WHERE form_no = $1',
                [form_no]
            );

            if (formCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: 'Nomor blanko sudah digunakan' },
                    { status: 400 }
                );
            }
        }

        // Insert certificate
        const result = await query(
            `INSERT INTO certifications (
                user_id,
                scheme_id,
                certification_name,
                certification_type,
                certification_number,
                registration_no,
                form_no,
                full_name,
                status,
                issued_date,
                expiry_date,
                score
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                user_id,
                scheme_id || null,
                certification_name,
                certification_type,
                certification_number || null,
                registration_no || null,
                form_no || null,
                full_name || null,
                status || 'pending',
                issued_date || null,
                expiry_date || null,
                score || null
            ]
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Certificate created successfully',
                data: result.rows[0]
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating certificate:', error);
        return NextResponse.json(
            { error: 'Failed to create certificate' },
            { status: 500 }
        );
    }
}
