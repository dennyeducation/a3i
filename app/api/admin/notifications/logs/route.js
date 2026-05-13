import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// GET /api/admin/notifications/logs
// Query params: page, limit, status, search
export async function GET(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')   || '1'));
    const limit  = Math.min(100, parseInt(searchParams.get('limit')  || '20'));
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) {
        conditions.push(`nl.status = $${idx}`);
        params.push(status);
        idx++;
    }

    if (search) {
        conditions.push(`(
            nl.recipient_email ILIKE $${idx}
            OR u.full_name ILIKE $${idx}
            OR u.username ILIKE $${idx}
            OR c.certification_name ILIKE $${idx}
        )`);
        params.push(`%${search}%`);
        idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [logsResult, countResult] = await Promise.all([
        query(
            `SELECT
                nl.id,
                nl.type,
                nl.channel,
                nl.subject,
                nl.recipient_email,
                nl.days_before,
                nl.status,
                nl.sent_at,
                nl.error_message,
                nl.created_at,
                u.id          AS user_id,
                u.full_name   AS user_full_name,
                u.username    AS user_username,
                c.id          AS cert_id,
                c.certification_name,
                c.certification_number,
                c.expiry_date
             FROM notification_logs nl
             JOIN users u ON nl.user_id = u.id
             JOIN certifications c ON nl.certification_id = c.id
             ${where}
             ORDER BY nl.created_at DESC
             LIMIT $${idx} OFFSET $${idx + 1}`,
            [...params, limit, offset]
        ),
        query(
            `SELECT COUNT(*) FROM notification_logs nl
             JOIN users u ON nl.user_id = u.id
             JOIN certifications c ON nl.certification_id = c.id
             ${where}`,
            params
        ),
    ]);

    // Summary stats (global)
    const [sentCount, failedCount, pendingCount] = await Promise.all([
        query(`SELECT COUNT(*) FROM notification_logs WHERE status = 'sent'`),
        query(`SELECT COUNT(*) FROM notification_logs WHERE status = 'failed'`),
        query(`SELECT COUNT(*) FROM notification_logs WHERE status = 'pending'`),
    ]);

    const total = parseInt(countResult.rows[0].count);

    const logs = logsResult.rows.map((r) => ({
        id:             r.id,
        type:           r.type,
        channel:        r.channel,
        subject:        r.subject,
        recipientEmail: r.recipient_email,
        daysBefore:     r.days_before,
        status:         r.status,
        sentAt:         r.sent_at,
        errorMessage:   r.error_message,
        createdAt:      r.created_at,
        user: {
            id:       r.user_id,
            fullName: r.user_full_name,
            username: r.user_username,
        },
        certification: {
            id:                  r.cert_id,
            certificationName:   r.certification_name,
            certificationNumber: r.certification_number,
            expiryDate:          r.expiry_date,
        },
    }));

    return NextResponse.json({
        success: true,
        data: logs,
        stats: {
            sent:    parseInt(sentCount.rows[0].count),
            failed:  parseInt(failedCount.rows[0].count),
            pending: parseInt(pendingCount.rows[0].count),
        },
        pagination: {
            page, limit, total,
            totalPages: Math.ceil(total / limit),
        },
    });
}
