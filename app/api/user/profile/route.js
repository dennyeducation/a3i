import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth, hashPassword, comparePassword, isValidEmail } from '@/lib/auth';

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await query(
            'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = $1',
            [auth.user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const auth = await requireAuth(request);
        if (!auth.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { full_name, email, username, current_password, new_password } = body;

        // Validate required fields
        if (!full_name && !email && !username && !new_password) {
            return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 });
        }

        if (email && !isValidEmail(email)) {
            return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
        }

        // Get current user data
        const userResult = await query(
            'SELECT id, username, email, full_name, password FROM users WHERE id = $1',
            [auth.user.id]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        const currentUser = userResult.rows[0];

        // Check if email/username already taken by another user
        if (email && email !== currentUser.email) {
            const emailCheck = await query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, auth.user.id]
            );
            if (emailCheck.rows.length > 0) {
                return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain' }, { status: 400 });
            }
        }

        if (username && username !== currentUser.username) {
            const usernameCheck = await query(
                'SELECT id FROM users WHERE username = $1 AND id != $2',
                [username, auth.user.id]
            );
            if (usernameCheck.rows.length > 0) {
                return NextResponse.json({ error: 'Username sudah digunakan oleh akun lain' }, { status: 400 });
            }
        }

        // Handle password change
        let hashedPassword = null;
        if (new_password) {
            if (!current_password) {
                return NextResponse.json({ error: 'Password saat ini wajib diisi untuk mengubah password' }, { status: 400 });
            }
            if (new_password.length < 6) {
                return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 });
            }
            const passwordMatch = await comparePassword(current_password, currentUser.password);
            if (!passwordMatch) {
                return NextResponse.json({ error: 'Password saat ini tidak sesuai' }, { status: 400 });
            }
            hashedPassword = await hashPassword(new_password);
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramIdx = 1;

        if (full_name !== undefined) { updates.push(`full_name = $${paramIdx++}`); values.push(full_name); }
        if (email) { updates.push(`email = $${paramIdx++}`); values.push(email); }
        if (username) { updates.push(`username = $${paramIdx++}`); values.push(username); }
        if (hashedPassword) { updates.push(`password = $${paramIdx++}`); values.push(hashedPassword); }
        updates.push(`updated_at = $${paramIdx++}`);
        values.push(new Date());
        values.push(auth.user.id);

        await query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
            values
        );

        // Return updated user
        const updatedResult = await query(
            'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = $1',
            [auth.user.id]
        );

        return NextResponse.json({ success: true, user: updatedResult.rows[0], message: 'Profil berhasil diperbarui' });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
