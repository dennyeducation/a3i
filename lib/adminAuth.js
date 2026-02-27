import { requireAuth } from './auth.js';
import { query } from './db.js';

// Middleware to check if user is admin
export const requireAdmin = async (request) => {
    const auth = await requireAuth(request);

    if (!auth.authenticated) {
        return { authenticated: false, authorized: false, error: auth.error };
    }

    // Check if user has admin role
    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPERADMIN') {
        return { authenticated: true, authorized: false, error: 'Access denied. Admin role required.' };
    }

    return { authenticated: true, authorized: true, user: auth.user };
};

// Check if user has specific role
export const requireRole = async (request, roles = []) => {
    const auth = await requireAuth(request);

    if (!auth.authenticated) {
        return { authenticated: false, authorized: false, error: auth.error };
    }

    // Check if user has one of the required roles
    if (!roles.includes(auth.user.role)) {
        return { authenticated: true, authorized: false, error: `Access denied. Required roles: ${roles.join(', ')}` };
    }

    return { authenticated: true, authorized: true, user: auth.user };
};

// Get user by ID from database
export const getUserById = async (userId) => {
    try {
        const result = await query(
            'SELECT id, username, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};
