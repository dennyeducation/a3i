import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/user/stats
 * Get user dashboard statistics
 * Returns: certificates count, applications count, assessments count
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

        // Get certificates count
        const certificatesResult = await query(
            `SELECT COUNT(*) as count FROM certifications
             WHERE user_id = $1 AND status = 'active'`,
            [userId]
        );

        // Get applications count (active applications)
        const applicationsResult = await query(
            `SELECT COUNT(*) as count FROM applications
             WHERE user_id = $1 AND status IN ('submitted', 'reviewing', 'approved')`,
            [userId]
        );

        // Get assessments count (scheduled/upcoming assessments)
        const assessmentsResult = await query(
            `SELECT COUNT(*) as count FROM assessments
             WHERE user_id = $1 AND status IN ('scheduled', 'in_progress')`,
            [userId]
        );

        // Get detailed stats for each category
        const certificateDetails = await query(
            `SELECT
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'expired') as expired,
                COUNT(*) as total
             FROM certifications
             WHERE user_id = $1`,
            [userId]
        );

        const applicationDetails = await query(
            `SELECT
                COUNT(*) FILTER (WHERE status = 'submitted') as submitted,
                COUNT(*) FILTER (WHERE status = 'reviewing') as reviewing,
                COUNT(*) FILTER (WHERE status = 'approved') as approved,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) as total
             FROM applications
             WHERE user_id = $1`,
            [userId]
        );

        const assessmentDetails = await query(
            `SELECT
                COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
                COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
                COUNT(*) as total
             FROM assessments
             WHERE user_id = $1`,
            [userId]
        );

        // Prepare response data
        const stats = {
            overview: {
                certificates: parseInt(certificatesResult.rows[0].count),
                applications: parseInt(applicationsResult.rows[0].count),
                assessments: parseInt(assessmentsResult.rows[0].count)
            },
            details: {
                certificates: {
                    active: parseInt(certificateDetails.rows[0]?.active || 0),
                    pending: parseInt(certificateDetails.rows[0]?.pending || 0),
                    expired: parseInt(certificateDetails.rows[0]?.expired || 0),
                    total: parseInt(certificateDetails.rows[0]?.total || 0)
                },
                applications: {
                    submitted: parseInt(applicationDetails.rows[0]?.submitted || 0),
                    reviewing: parseInt(applicationDetails.rows[0]?.reviewing || 0),
                    approved: parseInt(applicationDetails.rows[0]?.approved || 0),
                    rejected: parseInt(applicationDetails.rows[0]?.rejected || 0),
                    completed: parseInt(applicationDetails.rows[0]?.completed || 0),
                    total: parseInt(applicationDetails.rows[0]?.total || 0)
                },
                assessments: {
                    scheduled: parseInt(assessmentDetails.rows[0]?.scheduled || 0),
                    in_progress: parseInt(assessmentDetails.rows[0]?.in_progress || 0),
                    completed: parseInt(assessmentDetails.rows[0]?.completed || 0),
                    cancelled: parseInt(assessmentDetails.rows[0]?.cancelled || 0),
                    total: parseInt(assessmentDetails.rows[0]?.total || 0)
                }
            }
        };

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
