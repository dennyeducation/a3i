import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// GET /api/admin/notifications/expiring
// Query params: days (default 90), page (default 1), limit (default 20)
export async function GET(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const { searchParams } = new URL(request.url);
    const days  = parseInt(searchParams.get('days')  || '90');
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const offset = (page - 1) * limit;

    const now    = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const [certsResult, countResult] = await Promise.all([
        query(
            `SELECT
                c.id,
                c.certification_name,
                c.certification_number,
                c.expiry_date,
                c.scheme_id,
                u.id         AS user_id,
                u.full_name  AS user_full_name,
                u.email      AS user_email,
                u.username   AS user_username,
                cs.name      AS scheme_name,
                cs.code      AS scheme_code
             FROM certifications c
             JOIN users u ON c.user_id = u.id
             LEFT JOIN certification_schemes cs ON c.scheme_id = cs.id
             WHERE c.status = 'active'
               AND c.expiry_date > $1
               AND c.expiry_date <= $2
             ORDER BY c.expiry_date ASC
             LIMIT $3 OFFSET $4`,
            [now, cutoff, limit, offset]
        ),
        query(
            `SELECT COUNT(*) FROM certifications
             WHERE status = 'active' AND expiry_date > $1 AND expiry_date <= $2`,
            [now, cutoff]
        ),
    ]);

    const total = parseInt(countResult.rows[0].count);

    // For each cert, fetch sent notifications
    const certIds = certsResult.rows.map((r) => r.id);
    let sentLogsMap = {};
    if (certIds.length > 0) {
        const logsResult = await query(
            `SELECT certification_id, days_before, sent_at
             FROM notification_logs
             WHERE certification_id = ANY($1) AND status = 'sent'`,
            [certIds]
        );
        for (const log of logsResult.rows) {
            if (!sentLogsMap[log.certification_id]) sentLogsMap[log.certification_id] = [];
            sentLogsMap[log.certification_id].push({ daysBefore: log.days_before, sentAt: log.sent_at });
        }
    }

    const data = certsResult.rows.map((c) => {
        const expiry = new Date(c.expiry_date);
        const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
            id:                  c.id,
            certificationName:   c.certification_name,
            certificationNumber: c.certification_number,
            expiryDate:          c.expiry_date,
            daysRemaining,
            user: {
                id:       c.user_id,
                fullName: c.user_full_name,
                email:    c.user_email,
                username: c.user_username,
            },
            scheme: c.scheme_id ? {
                id:   c.scheme_id,
                name: c.scheme_name,
                code: c.scheme_code,
            } : null,
            sentNotifications: sentLogsMap[c.id] || [],
        };
    });

    return NextResponse.json({
        success: true,
        data,
        pagination: {
            page, limit, total,
            totalPages: Math.ceil(total / limit),
        },
    });
}
