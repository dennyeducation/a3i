import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// GET - Get user by ID
export async function GET(request, { params }) {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    try {
        const { id } = params;

        const result = await query(
            'SELECT id, username, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PUT - Update user
export async function PUT(request, { params }) {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    try {
        const { id } = params;
        const body = await request.json();
        const { username, email, password, full_name, role, is_active } = body;

        // Check if user exists
        const existingUser = await query('SELECT id FROM users WHERE id = $1', [id]);

        if (existingUser.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Build update query dynamically
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (username !== undefined) {
            updates.push(`username = $${paramCount}`);
            params.push(username);
            paramCount++;
        }

        if (email !== undefined) {
            updates.push(`email = $${paramCount}`);
            params.push(email);
            paramCount++;
        }

        if (password) {
            const hashedPassword = await hashPassword(password);
            updates.push(`password = $${paramCount}`);
            params.push(hashedPassword);
            paramCount++;
        }

        if (full_name !== undefined) {
            updates.push(`full_name = $${paramCount}`);
            params.push(full_name);
            paramCount++;
        }

        if (role !== undefined) {
            updates.push(`role = $${paramCount}`);
            params.push(role);
            paramCount++;
        }

        if (is_active !== undefined) {
            updates.push(`is_active = $${paramCount}`);
            params.push(is_active);
            paramCount++;
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(id);

        const queryText = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, username, email, full_name, role, is_active, created_at, updated_at
        `;

        const result = await query(queryText, params);

        return NextResponse.json({
            success: true,
            message: 'User updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    try {
        const { id } = params;

        // Check if user exists
        const existingUser = await query('SELECT id FROM users WHERE id = $1', [id]);

        if (existingUser.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent admin from deleting themselves
        if (parseInt(id) === auth.user.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        // Delete user
        await query('DELETE FROM users WHERE id = $1', [id]);

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
