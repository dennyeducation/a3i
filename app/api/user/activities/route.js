import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/user/activities
 * Get user recent activities
 * Query params:
 * - limit: number of activities to return (default: 10, max: 50)
 * - offset: offset for pagination (default: 0)
 */
export async function GET(request) {
    try {
        // Authenticate user
        const auth = await requireAuth(request);

        if (!auth.authenticated) {
            return NextResponse.json(
                { success: false, error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        const userId = auth.user.id;

        // Get query params
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
        const offset = parseInt(searchParams.get('offset') || '0');

        // Get activities
        const activitiesResult = await query(
            `SELECT
                id,
                activity_type,
                title,
                description,
                metadata,
                created_at
             FROM activities
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        // Get total count
        const countResult = await query(
            'SELECT COUNT(*) as total FROM activities WHERE user_id = $1',
            [userId]
        );

        const totalActivities = parseInt(countResult.rows[0].total);

        return NextResponse.json({
            success: true,
            data: activitiesResult.rows,
            pagination: {
                limit,
                offset,
                total: totalActivities,
                hasMore: offset + limit < totalActivities
            }
        });

    } catch (error) {
        console.error('Error fetching user activities:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activities' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/user/activities
 * Create a new activity log
 * Body:
 * - activity_type: string (required)
 * - title: string (required)
 * - description: string (optional)
 * - metadata: object (optional)
 */
export async function POST(request) {
    try {
        // Authenticate user
        const auth = await requireAuth(request);

        if (!auth.authenticated) {
            return NextResponse.json(
                { success: false, error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        const userId = auth.user.id;
        const body = await request.json();

        // Validate required fields
        if (!body.activity_type || !body.title) {
            return NextResponse.json(
                { success: false, error: 'activity_type and title are required' },
                { status: 400 }
            );
        }

        // Get IP and user agent
        const ip = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Insert activity
        const result = await query(
            `INSERT INTO activities (
                user_id,
                activity_type,
                title,
                description,
                metadata,
                ip_address,
                user_agent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, activity_type, title, description, metadata, created_at`,
            [
                userId,
                body.activity_type,
                body.title,
                body.description || null,
                body.metadata ? JSON.stringify(body.metadata) : null,
                ip,
                userAgent
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Activity logged successfully',
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating activity:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create activity' },
            { status: 500 }
        );
    }
}
