import nodemailer from 'nodemailer';

// ────────────────────────────────────────────────────────────
// Transporter
// ────────────────────────────────────────────────────────────
function createTransporter() {
    return nodemailer.createTransport({
        host:   process.env.SMTP_HOST || 'smtp.gmail.com',
        port:   parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

export async function verifyEmailConfig() {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
}

// ────────────────────────────────────────────────────────────
// Send single email
// ────────────────────────────────────────────────────────────
export async function sendEmail({ to, subject, html }) {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"LSP A3I" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
}

// ────────────────────────────────────────────────────────────
// Email template: peringatan kadaluarsa sertifikat
// ────────────────────────────────────────────────────────────
export function buildExpiryAlertHtml({ recipientName, certificationName, certificationNumber, expiryDate, daysRemaining, renewalUrl }) {
    const urgencyColor =
        daysRemaining <= 7  ? '#dc2626' :
        daysRemaining <= 30 ? '#d97706' : '#2563eb';

    const urgencyLabel =
        daysRemaining <= 7  ? 'SANGAT MENDESAK' :
        daysRemaining <= 30 ? 'SEGERA' : 'PEMBERITAHUAN';

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Peringatan Kadaluarsa Sertifikat</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1a3a5c 100%);padding:32px 40px;text-align:center;">
      <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">
        LSP A3I
      </h1>
      <p style="color:#94a3b8;font-size:13px;margin:6px 0 0;">
        Lembaga Sertifikasi Profesi Alat Angkat dan Angkut Indonesia
      </p>
    </div>

    <!-- Badge urgency -->
    <div style="background:${urgencyColor}10;border-top:4px solid ${urgencyColor};padding:16px 40px;">
      <span style="display:inline-block;background:${urgencyColor};color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:100px;">
        ${urgencyLabel}
      </span>
      <span style="color:${urgencyColor};font-weight:700;font-size:15px;margin-left:12px;">
        Sertifikat akan kadaluarsa dalam ${daysRemaining} hari
      </span>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Yth. <strong>${recipientName}</strong>,
      </p>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Kami menginformasikan bahwa sertifikat kompetensi Anda akan segera habis masa berlakunya.
        Segera lakukan perpanjangan agar sertifikat Anda tetap valid.
      </p>

      <!-- Certificate card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:28px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:13px;width:40%;">Nama Sertifikasi</td>
            <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:600;">${certificationName}</td>
          </tr>
          ${certificationNumber ? `
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0;">No. Sertifikat</td>
            <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:600;font-family:monospace;border-top:1px solid #e2e8f0;">${certificationNumber}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0;">Berlaku Sampai</td>
            <td style="padding:8px 0;font-size:13px;font-weight:700;color:${urgencyColor};border-top:1px solid #e2e8f0;">${expiryDate}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0;">Sisa Masa Berlaku</td>
            <td style="padding:8px 0;font-size:13px;font-weight:700;color:${urgencyColor};border-top:1px solid #e2e8f0;">${daysRemaining} hari lagi</td>
          </tr>
        </table>
      </div>

      ${renewalUrl ? `
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${renewalUrl}"
           style="display:inline-block;background:#0f172a;color:#ffffff;font-size:14px;font-weight:700;
                  padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
          Ajukan Perpanjangan Sekarang
        </a>
      </div>` : ''}

      <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;">
        Jika Anda sudah melakukan perpanjangan atau sertifikat ini tidak relevan, abaikan email ini.
        Untuk pertanyaan, hubungi kami di <a href="mailto:${process.env.SMTP_USER}" style="color:#0f172a;">${process.env.SMTP_USER}</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        &copy; ${new Date().getFullYear()} LSP A3I &mdash; Email ini dikirim otomatis, jangan balas email ini.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ────────────────────────────────────────────────────────────
// Email template: tes koneksi
// ────────────────────────────────────────────────────────────
export function buildTestEmailHtml(adminEmail) {
    return `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:32px;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <h2 style="color:#0f172a;margin:0 0 12px;">Konfigurasi Email Berhasil ✓</h2>
    <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 16px;">
      Email tes berhasil dikirim dari sistem notifikasi LSP A3I.
      Konfigurasi SMTP Anda sudah benar dan siap digunakan.
    </p>
    <p style="color:#94a3b8;font-size:12px;margin:0;">Dikirim ke: ${adminEmail}</p>
  </div>
</body>
</html>`;
}
