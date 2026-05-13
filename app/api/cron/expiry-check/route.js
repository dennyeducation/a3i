import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail, buildExpiryAlertHtml } from '@/lib/email';

// GET /api/cron/expiry-check
// Dipanggil oleh Vercel Cron (vercel.json) atau trigger manual.
// Proteksi via CRON_SECRET header.
export async function GET(request) {
    const secret = request.headers.get('x-cron-secret') ??
                   new URL(request.url).searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Baca konfigurasi dari DB
    const settingRows = await query(
        `SELECT key, value FROM notification_settings WHERE key IN ('email_enabled', 'notify_days')`
    );
    const settings = Object.fromEntries(settingRows.rows.map((r) => [r.key, r.value]));

    if (settings['email_enabled'] === 'false') {
        return NextResponse.json({ skipped: true, reason: 'email_disabled' });
    }

    const intervals = (settings['notify_days'] || '90,30,7')
        .split(',')
        .map((d) => parseInt(d.trim()))
        .filter((d) => !isNaN(d));

    const now = new Date();
    let totalSent   = 0;
    let totalFailed = 0;

    for (const daysBefore of intervals) {
        // Window: hari ini ± 12 jam untuk menghindari double kirim
        const windowStart = new Date(now.getTime() + (daysBefore - 0.5) * 24 * 60 * 60 * 1000);
        const windowEnd   = new Date(now.getTime() + (daysBefore + 0.5) * 24 * 60 * 60 * 1000);

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
             WHERE c.status = 'active'
               AND c.expiry_date > $1
               AND c.expiry_date <= $2`,
            [windowStart, windowEnd]
        );

        for (const cert of certsResult.rows) {
            if (!cert.user_email || !cert.expiry_date) continue;

            // Skip jika sudah pernah dikirim untuk interval ini
            const existingLog = await query(
                `SELECT id FROM notification_logs
                 WHERE certification_id = $1 AND days_before = $2 AND status = 'sent'`,
                [cert.id, daysBefore]
            );
            if (existingLog.rows.length > 0) continue;

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
                [cert.id, cert.user_id, subject, cert.user_email, daysBefore]
            );
            const logId = logResult.rows[0].id;

            const result = await sendEmail({ to: cert.user_email, subject, html });

            if (result.ok) {
                await query(
                    `UPDATE notification_logs SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = $1`,
                    [logId]
                );
                totalSent++;
            } else {
                await query(
                    `UPDATE notification_logs SET status = 'failed', error_message = $1 WHERE id = $2`,
                    [result.error, logId]
                );
                totalFailed++;
            }
        }
    }

    return NextResponse.json({
        success:   true,
        ran_at:    now.toISOString(),
        intervals,
        sent:      totalSent,
        failed:    totalFailed,
    });
}
