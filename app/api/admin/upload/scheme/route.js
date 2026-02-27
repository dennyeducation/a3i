import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// POST /api/admin/upload/scheme — upload gambar skema sertifikasi
export async function POST(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const formData = await request.formData();
        const file     = formData.get('file');

        if (!file || typeof file === 'string')
            return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type))
            return NextResponse.json({ error: 'Hanya file gambar (JPG, PNG, WEBP, GIF) yang diizinkan' }, { status: 400 });

        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize)
            return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });

        const ext      = file.name.split('.').pop().toLowerCase();
        const filename = `${randomUUID()}.${ext}`;
        const bytes    = await file.arrayBuffer();
        const buffer   = Buffer.from(bytes);

        // Coba simpan ke public/uploads/schemes (lokal/dev)
        // Pada Vercel filesystem read-only — tulis ke /tmp sebagai fallback
        let url;
        try {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'schemes');
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            url = `/uploads/schemes/${filename}`;
        } catch {
            const tmpPath = path.join('/tmp', filename);
            await writeFile(tmpPath, buffer);
            url = `/tmp/${filename}`;
        }

        return NextResponse.json({ success: true, url });
    } catch (e) {
        console.error('Upload scheme error:', e);
        return NextResponse.json({ error: `Gagal mengupload file: ${e.message}` }, { status: 500 });
    }
}
