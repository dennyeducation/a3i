import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { query } from '@/lib/db';
import { requireRole, USER_ROLES } from '@/lib/auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXT = ['.xlsx', '.xls'];

// Kolom template (urutan tampil di file contoh, pencocokan berdasar nama header)
const TEMPLATE_HEADERS = [
    'No', 'Tanggal Terbit', 'No. Sertifikat', 'No. Registrasi', 'No. Blanko', 'Nama', 'Skema Sertifikasi', 'Masa Berlaku',
];

function normalizeHeader(h) {
    return String(h || '').trim().toLowerCase();
}

// Cocokkan nama kolom di file dengan field internal (fleksibel terhadap variasi penulisan header)
function matchField(header) {
    const h = normalizeHeader(header);
    if (h === 'no' || h === 'no.') return null; // diabaikan
    if (h.includes('terbit')) return 'issued_date';
    if (h.includes('registrasi')) return 'registration_no';
    if (h.includes('blanko')) return 'form_no';
    if (h.includes('sertifikat')) return 'certification_number';
    if (h.includes('skema')) return 'scheme';
    if (h.includes('berlaku')) return 'expiry_date';
    if (h.includes('nama')) return 'full_name';
    return null;
}

// SheetJS hanya menyimpan nilai pada sel kiri-atas dari sebuah merged range;
// sel lain dalam range tersebut kosong. Salin nilainya ke semua sel dalam range
// agar baris yang "menumpang" merge (mis. kolom Nama/Skema digabung ke bawah) tidak terbaca kosong.
function fillMergedCells(sheet) {
    const merges = sheet['!merges'] || [];
    for (const range of merges) {
        const anchorAddr = XLSX.utils.encode_cell({ r: range.s.r, c: range.s.c });
        const anchorCell = sheet[anchorAddr];
        if (!anchorCell) continue;
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                if (R === range.s.r && C === range.s.c) continue;
                const addr = XLSX.utils.encode_cell({ r: R, c: C });
                sheet[addr] = { ...anchorCell };
            }
        }
    }
}

function excelSerialToDate(serial) {
    // Excel epoch: 1899-12-30
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    return new Date(utcValue * 1000);
}

function parseDateValue(value) {
    if (value === null || value === undefined || value === '') return { ok: true, value: null };
    if (value instanceof Date && !isNaN(value.getTime())) {
        return { ok: true, value: value.toISOString().slice(0, 10) };
    }
    if (typeof value === 'number') {
        const d = excelSerialToDate(value);
        if (isNaN(d.getTime())) return { ok: false };
        return { ok: true, value: d.toISOString().slice(0, 10) };
    }
    if (typeof value === 'string') {
        const s = value.trim();
        // YYYY-MM-DD
        let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (m) return { ok: true, value: `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` };
        // DD/MM/YYYY or DD-MM-YYYY
        m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m) return { ok: true, value: `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` };
        const d = new Date(s);
        if (!isNaN(d.getTime())) return { ok: true, value: d.toISOString().slice(0, 10) };
        return { ok: false };
    }
    return { ok: false };
}

// GET /api/admin/certificates/import - unduh template Excel
export async function GET(request) {
    const auth = await requireRole(request, USER_ROLES.ADMIN);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.error === 'Unauthorized' ? 401 : 403 });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        TEMPLATE_HEADERS,
        [1, '2026-01-15', 'LSP-A3I-2026-001', 'REG-2026-001', 'BLK-2026-001', 'Budi Santoso', 'Junior Web Developer', '2029-01-15'],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="template-import-sertifikat.xlsx"',
        },
    });
}

// POST /api/admin/certificates/import - import sertifikat dari file Excel
export async function POST(request) {
    const auth = await requireRole(request, USER_ROLES.ADMIN);
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.error === 'Unauthorized' ? 401 : 403 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
        }

        const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) {
            return NextResponse.json({ error: 'Hanya file Excel (.xlsx, .xls) yang diizinkan' }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const wb = XLSX.read(bytes, { type: 'buffer', cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        fillMergedCells(sheet);
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });

        if (rows.length === 0) {
            return NextResponse.json({ error: 'File Excel kosong' }, { status: 400 });
        }

        const headerRow = rows[0];
        const fieldByCol = headerRow.map(matchField);
        const dataRows = rows.slice(1).filter(r => r.some(cell => String(cell ?? '').trim() !== ''));

        if (dataRows.length === 0) {
            return NextResponse.json({ error: 'Tidak ada data pada file Excel' }, { status: 400 });
        }

        // "proceed" dikirim ulang oleh klien setelah user mengonfirmasi untuk melewati
        // baris-baris dengan skema yang belum terdaftar
        const proceed = formData.get('proceed') === 'true';

        // Ambil semua skema untuk lookup nama/kode -> id
        const schemesResult = await query('SELECT id, code, name FROM certification_schemes', []);
        const schemeByKey = new Map();
        for (const s of schemesResult.rows) {
            schemeByKey.set(normalizeHeader(s.name), s);
            schemeByKey.set(normalizeHeader(s.code), s);
        }

        // ─── Pass 1: parse & validasi semua baris (belum insert apapun) ───
        const seenCertNumbers = new Set();
        const seenRegNumbers = new Set();
        const seenFormNumbers = new Set();
        const missingSchemesByKey = new Map(); // schemeText (normalized) -> { text, rows: [] }
        const parsedRows = [];

        for (let i = 0; i < dataRows.length; i++) {
            const rowNum = i + 2; // baris ke-berapa di file (1 = header)
            const row = dataRows[i];
            const record = {};
            headerRow.forEach((h, idx) => {
                const field = fieldByCol[idx];
                if (field) record[field] = row[idx];
            });

            const rowErrors = [];

            const fullName = String(record.full_name ?? '').trim();
            if (!fullName) rowErrors.push('Nama wajib diisi');

            const schemeText = String(record.scheme ?? '').trim();
            let scheme = null;
            let missingScheme = false;
            if (!schemeText) {
                rowErrors.push('Skema sertifikasi wajib diisi');
            } else {
                scheme = schemeByKey.get(normalizeHeader(schemeText));
                if (!scheme) {
                    missingScheme = true;
                    const key = normalizeHeader(schemeText);
                    if (!missingSchemesByKey.has(key)) missingSchemesByKey.set(key, { text: schemeText, rows: [] });
                    missingSchemesByKey.get(key).rows.push(rowNum);
                }
            }

            const issued = parseDateValue(record.issued_date);
            if (!issued.ok) rowErrors.push('Format tanggal terbit tidak valid');

            const expiry = parseDateValue(record.expiry_date);
            if (!expiry.ok) rowErrors.push('Format masa berlaku tidak valid');

            const certNumber = String(record.certification_number ?? '').trim() || null;
            const regNo = String(record.registration_no ?? '').trim() || null;
            const formNo = String(record.form_no ?? '').trim() || null;

            if (certNumber) {
                if (seenCertNumbers.has(certNumber)) rowErrors.push(`No. sertifikat "${certNumber}" duplikat di file`);
                seenCertNumbers.add(certNumber);
            }
            if (regNo) {
                if (seenRegNumbers.has(regNo)) rowErrors.push(`No. registrasi "${regNo}" duplikat di file`);
                seenRegNumbers.add(regNo);
            }
            if (formNo) {
                if (seenFormNumbers.has(formNo)) rowErrors.push(`No. blanko "${formNo}" duplikat di file`);
                seenFormNumbers.add(formNo);
            }

            parsedRows.push({ rowNum, fullName, scheme, schemeText, missingScheme, issued, expiry, certNumber, regNo, formNo, rowErrors });
        }

        // Jika ada skema yang belum terdaftar dan user belum mengonfirmasi, minta konfirmasi dulu
        if (missingSchemesByKey.size > 0 && !proceed) {
            const missingSchemes = Array.from(missingSchemesByKey.values()).map(m => ({
                name: m.text,
                rows: m.rows,
                count: m.rows.length,
            }));
            const affectedRows = missingSchemes.reduce((sum, m) => sum + m.count, 0);
            return NextResponse.json({
                success: true,
                needsConfirmation: true,
                missingSchemes,
                affectedRows,
                total: dataRows.length,
            });
        }

        // ─── Pass 2: eksekusi insert ───
        let imported = 0;
        const errors = [];
        const skipped = [];

        for (const r of parsedRows) {
            if (r.missingScheme) {
                skipped.push({ row: r.rowNum, message: `Skema sertifikasi "${r.schemeText}" belum terdaftar — dilewati` });
                continue;
            }
            if (r.rowErrors.length > 0) {
                errors.push({ row: r.rowNum, message: r.rowErrors.join('; ') });
                continue;
            }

            try {
                await query(
                    `INSERT INTO certifications (
                        user_id, scheme_id, certification_name, certification_type,
                        certification_number, registration_no, form_no, full_name,
                        status, issued_date, expiry_date
                    )
                    VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, 'active', $8, $9)`,
                    [r.scheme.id, r.scheme.name, r.scheme.name, r.certNumber, r.regNo, r.formNo, r.fullName, r.issued.value, r.expiry.value]
                );
                imported++;
            } catch (e) {
                let msg = 'Gagal menyimpan baris';
                if (e.code === '23505') {
                    if (e.constraint?.includes('certification_number')) msg = `No. sertifikat "${r.certNumber}" sudah digunakan`;
                    else if (e.constraint?.includes('registration_no')) msg = `No. registrasi "${r.regNo}" sudah digunakan`;
                    else if (e.constraint?.includes('form_no')) msg = `No. blanko "${r.formNo}" sudah digunakan`;
                    else msg = 'Data duplikat';
                }
                errors.push({ row: r.rowNum, message: msg });
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            failed: errors.length,
            skippedCount: skipped.length,
            total: dataRows.length,
            errors,
            skipped,
        });
    } catch (error) {
        console.error('Error importing certificates:', error);
        return NextResponse.json({ error: 'Gagal mengimpor file Excel' }, { status: 500 });
    }
}
