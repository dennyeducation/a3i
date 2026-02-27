import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export const config = { api: { bodyParser: false } };

// POST /api/admin/upload  — upload foto asesi
export async function POST(request) {
    const auth = await requireAdmin(request);
    if (!auth.authorized)
        return NextResponse.json({ error: auth.error }, { status: auth.authenticated ? 403 : 401 });

    try {
        const formData = await request.formData();
        const file     = formData.get('file');

        if (!file || typeof file === 'string')
            return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });

        // Validasi tipe file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type))
            return NextResponse.json({ error: 'Hanya file gambar (JPG, PNG, WEBP, GIF) yang diizinkan' }, { status: 400 });

        // Validasi ukuran file (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize)
            return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });

        // Buat nama file unik
        const ext      = file.name.split('.').pop().toLowerCase();
        const filename = `${randomUUID()}.${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'asesi');

        // Pastikan direktori ada
        await mkdir(uploadDir, { recursive: true });

        // Tulis file
        const bytes  = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(path.join(uploadDir, filename), buffer);

        const url = `/uploads/asesi/${filename}`;
        return NextResponse.json({ success: true, url });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 });
    }
}
