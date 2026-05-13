import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';
import { sendEmail, buildExpiryAlertHtml } from '@/lib/email';

// POST /api/admin/notifications/send
// Body: { certificationIds: number[] }  — kirim ke sertifikat tertentu
//   OR: { all: true, daysThreshold: number } — kirim ke semua yang masuk threshold
export async function POST(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const body = await request.json();

    let certIds = [];

    if (body.all && body.daysThreshold) {
        const now    = new Date();
        const cutoff = new Date(now.getTime() + body.daysThreshold * 24 * 60 * 60 * 1000);
        const result = await query(
            `SELECT id FROM certifications WHERE status = 'active' AND expiry_date > $1 AND expiry_date <= $2`,
            [now, cutoff]
        );
        certIds = result.rows.map((r) => r.id);
    } else if (body.certificationIds?.length) {
        certIds = body.certificationIds;
    } else {
        return NextResponse.json({ error: 'Tidak ada sertifikat dipilih' }, { status: 400 });
    }

    if (certIds.length === 0) {
        return NextResponse.json({ error: 'Tidak ada sertifikat yang memenuhi kriteria' }, { status: 400 });
    }

    // Fetch certifications with user data
    const certsResult = await query(
        `SELECT
            c.id,
            c.certification_name,
            c.certification_number,
            c.expiry_date,
            u.id        AS user_id,
            u.full_name AS user_full_name,
            u.email     AS user_email,
            u.username  AS user_username
         FROM certifications c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ANY($1)`,
        [certIds]
    );

    const results = { sent: 0, failed: 0, skipped: 0 };
    const now = new Date();

    for (const cert of certsResult.rows) {
        if (!cert.expiry_date || !cert.user_email) {
            results.skipped++;
            continue;
        }

        const expiry = new Date(cert.expiry_date);
        const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const recipientName = cert.user_full_name || cert.user_username;
        const subject = `[LSP A3I] Sertifikat Anda akan kadaluarsa dalam ${daysRemaining} hari`;

        const html = buildExpiryAlertHtml({
            recipientName,
            certificationName:   cert.certification_name,
            certificationNumber: cert.certification_number,
            expiryDate: expiry.toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
            }),
            daysRemaining,
            renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/profile`,
        });

        // Create log entry (pending)
        const logResult = await query(
            `INSERT INTO notification_logs
                (certification_id, user_id, type, channel, subject, recipient_email, days_before, status)
             VALUES ($1, $2, 'email', 'expiry_alert', $3, $4, $5, 'pending')
             RETURNING id`,
            [cert.id, cert.user_id, subject, cert.user_email, daysRemaining]
        );
        const logId = logResult.rows[0].id;

        const result = await sendEmail({ to: cert.user_email, subject, html });

        if (result.ok) {
            await query(
                `UPDATE notification_logs SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [logId]
            );
            results.sent++;
        } else {
            await query(
                `UPDATE notification_logs SET status = 'failed', error_message = $1 WHERE id = $2`,
                [result.error, logId]
            );
            results.failed++;
        }
    }

    return NextResponse.json({
        success: true,
        message: `Selesai: ${results.sent} terkirim, ${results.failed} gagal, ${results.skipped} dilewati`,
        results,
    });
}
