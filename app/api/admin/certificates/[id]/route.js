import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole, USER_ROLES } from '@/lib/auth';

// GET /api/admin/certificates/[id] - Get certificate by ID
export async function GET(request, { params }) {
    // Check if user is admin
    const auth = await requireRole(request, USER_ROLES.ADMIN);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.error === 'Unauthorized' ? 401 : 403 }
        );
    }

    try {
        const { id } = await params;

        const result = await query(
            `SELECT
                c.*,
                u.username,
                u.email,
                u.full_name as user_full_name,
                cs.name as scheme_name,
                cs.code as scheme_code
            FROM certifications c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN certification_schemes cs ON c.scheme_id = cs.id
            WHERE c.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Certificate not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching certificate:', error);
        return NextResponse.json(
            { error: 'Failed to fetch certificate' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/certificates/[id] - Update certificate
export async function PUT(request, { params }) {
    // Check if user is admin
    const auth = await requireRole(request, USER_ROLES.ADMIN);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.error === 'Unauthorized' ? 401 : 403 }
        );
    }

    try {
        const { id } = await params;
        const body = await request.json();

        // Check if certificate exists
        const certCheck = await query(
            'SELECT * FROM certifications WHERE id = $1',
            [id]
        );

        if (certCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'Certificate not found' },
                { status: 404 }
            );
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramIndex = 1;

        const allowedFields = [
            'scheme_id',
            'certification_name',
            'certification_type',
            'certification_number',
            'registration_no',
            'form_no',
            'full_name',
            'status',
            'issued_date',
            'expiry_date',
            'score'
        ];

        // Check if scheme exists (if being updated)
        if (body.scheme_id) {
            const schemeCheck = await query(
                'SELECT id FROM certification_schemes WHERE id = $1',
                [body.scheme_id]
            );

            if (schemeCheck.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Skema sertifikasi tidak ditemukan' },
                    { status: 404 }
                );
            }
        }

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates.push(`${field} = $${paramIndex}`);
                values.push(body[field]);
                paramIndex++;
            }
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        // Check certification number uniqueness if being updated
        if (body.certification_number && body.certification_number !== certCheck.rows[0].certification_number) {
            const numberCheck = await query(
                'SELECT id FROM certifications WHERE certification_number = $1 AND id != $2',
                [body.certification_number, id]
            );

            if (numberCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: 'Certification number already exists' },
                    { status: 400 }
                );
            }
        }

        // Check registration number uniqueness if being updated
        if (body.registration_no && body.registration_no !== certCheck.rows[0].registration_no) {
            const regCheck = await query(
                'SELECT id FROM certifications WHERE registration_no = $1 AND id != $2',
                [body.registration_no, id]
            );

            if (regCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: 'Nomor registrasi sudah digunakan' },
                    { status: 400 }
                );
            }
        }

        // Check form number uniqueness if being updated
        if (body.form_no && body.form_no !== certCheck.rows[0].form_no) {
            const formCheck = await query(
                'SELECT id FROM certifications WHERE form_no = $1 AND id != $2',
                [body.form_no, id]
            );

            if (formCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: 'Nomor blanko sudah digunakan' },
                    { status: 400 }
                );
            }
        }

        // Add updated_at
        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        // Add id to values
        values.push(id);

        const updateQuery = `
            UPDATE certifications
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        return NextResponse.json({
            success: true,
            message: 'Certificate updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating certificate:', error);
        return NextResponse.json(
            { error: 'Failed to update certificate' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/certificates/[id] - Delete certificate
export async function DELETE(request, { params }) {
    // Check if user is admin
    const auth = await requireRole(request, USER_ROLES.ADMIN);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.error === 'Unauthorized' ? 401 : 403 }
        );
    }

    try {
        const { id } = await params;

        // Check if certificate exists
        const certCheck = await query(
            'SELECT * FROM certifications WHERE id = $1',
            [id]
        );

        if (certCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'Certificate not found' },
                { status: 404 }
            );
        }

        // Delete certificate
        await query('DELETE FROM certifications WHERE id = $1', [id]);

        return NextResponse.json({
            success: true,
            message: 'Certificate deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting certificate:', error);
        return NextResponse.json(
            { error: 'Failed to delete certificate' },
            { status: 500 }
        );
    }
}
