import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// Default settings (used when no row exists in DB yet)
const DEFAULTS = {
    email_enabled:     'true',
    notify_days:       '90,30,7',
    smtp_host:         process.env.SMTP_HOST || '',
    smtp_port:         process.env.SMTP_PORT || '587',
    smtp_user:         process.env.SMTP_USER || '',
    smtp_secure:       process.env.SMTP_SECURE || 'false',
    smtp_from:         process.env.SMTP_FROM || '',
    auto_send_enabled: 'true',
    send_time:         '07:00',
};

async function getSettings() {
    const result = await query('SELECT key, value FROM notification_settings');
    const map = { ...DEFAULTS };
    for (const row of result.rows) {
        map[row.key] = row.value;
    }
    return map;
}

// GET /api/admin/notifications/settings
export async function GET(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings });
}

// PUT /api/admin/notifications/settings
export async function PUT(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const body = await request.json();
    const allowed = [
        'email_enabled', 'notify_days', 'smtp_host', 'smtp_port',
        'smtp_user', 'smtp_pass', 'smtp_secure', 'smtp_from',
        'auto_send_enabled', 'send_time',
    ];

    const updates = Object.entries(body).filter(([k]) => allowed.includes(k));

    await Promise.all(
        updates.map(([key, value]) =>
            query(
                `INSERT INTO notification_settings (key, value)
                 VALUES ($1, $2)
                 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
                [key, String(value)]
            )
        )
    );

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil disimpan' });
}
