import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// GET - Get all users (with pagination)
export async function GET(request) {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        const offset = (page - 1) * limit;

        // Build query
        let queryText = `
            SELECT id, username, email, full_name, role, is_active, created_at, updated_at
            FROM users
            WHERE 1=1
        `;
        let countText = 'SELECT COUNT(*) FROM users WHERE 1=1';
        const params = [];
        let paramCount = 1;

        // Add search filter
        if (search) {
            queryText += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
            countText += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        // Add role filter
        if (role) {
            queryText += ` AND role = $${paramCount}`;
            countText += ` AND role = $${paramCount}`;
            params.push(role);
            paramCount++;
        }

        // Add pagination
        queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        const queryParams = [...params, limit, offset];
        const countParams = [...params];

        // Execute queries
        const [usersResult, countResult] = await Promise.all([
            query(queryText, queryParams),
            query(countText, countParams)
        ]);

        const totalUsers = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalUsers / limit);

        return NextResponse.json({
            success: true,
            data: usersResult.rows,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST - Create new user
export async function POST(request) {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    try {
        const body = await request.json();
        const { username, email, password, full_name, role } = body;

        // Validation
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'Username, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: 'Username or email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert user
        const result = await query(
            `INSERT INTO users (username, email, password, full_name, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, username, email, full_name, role, is_active, created_at`,
            [username, email, hashedPassword, full_name || null, role || 'user']
        );

        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            data: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
