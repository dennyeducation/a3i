import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { sendEmail, buildTestEmailHtml, verifyEmailConfig } from '@/lib/email';

// POST /api/admin/notifications/send-test
// Body: { email?: string }  — jika kosong pakai email admin yang login
export async function POST(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });
    }

    const body  = await request.json().catch(() => ({}));
    const target = body.email || auth.user?.email || '';

    if (!target) {
        return NextResponse.json({ error: 'Email tujuan tidak ditemukan' }, { status: 400 });
    }

    // Verify SMTP config first
    const verify = await verifyEmailConfig();
    if (!verify.ok) {
        return NextResponse.json({
            error: `Konfigurasi SMTP tidak valid: ${verify.error}`,
        }, { status: 422 });
    }

    const result = await sendEmail({
        to:      target,
        subject: '[LSP A3I] Tes Konfigurasi Email',
        html:    buildTestEmailHtml(target),
    });

    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Email tes berhasil dikirim ke ${target}` });
}
