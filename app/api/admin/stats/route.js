import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { query } from '@/lib/db';

// GET - Get dashboard statistics
export async function GET(request) {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized' },
            { status: auth.authenticated ? 403 : 401 }
        );
    }

    try {
        // Get total users
        const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
        const totalUsers = parseInt(totalUsersResult.rows[0].count);

        // Get users by role
        const usersByRoleResult = await query(`
            SELECT role, COUNT(*) as count
            FROM users
            GROUP BY role
        `);

        // Get active users
        const activeUsersResult = await query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
        const activeUsers = parseInt(activeUsersResult.rows[0].count);

        // Get new users this month
        const newUsersResult = await query(`
            SELECT COUNT(*) as count
            FROM users
            WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        `);
        const newUsersThisMonth = parseInt(newUsersResult.rows[0].count);

        // Get new users today
        const newUsersTodayResult = await query(`
            SELECT COUNT(*) as count
            FROM users
            WHERE DATE(created_at) = CURRENT_DATE
        `);
        const newUsersToday = parseInt(newUsersTodayResult.rows[0].count);

        // Get recent users (last 7 days by day)
        const recentUsersResult = await query(`
            SELECT
                DATE(created_at) as date,
                COUNT(*) as count
            FROM users
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Get recent activity (last 10 users)
        const recentActivityResult = await query(`
            SELECT id, username, email, full_name, role, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 10
        `);

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers: totalUsers - activeUsers,
                    newUsersThisMonth,
                    newUsersToday
                },
                usersByRole: usersByRoleResult.rows.reduce((acc, row) => {
                    acc[row.role] = parseInt(row.count);
                    return acc;
                }, {}),
                recentUsers: recentUsersResult.rows.map(row => ({
                    date: row.date,
                    count: parseInt(row.count)
                })),
                recentActivity: recentActivityResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
