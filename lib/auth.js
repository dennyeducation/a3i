import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Hash password
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

// Verify JWT token
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Extract token from request headers
export const extractToken = (request) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};

// Middleware to protect routes
export const requireAuth = async (request) => {
    const token = extractToken(request);

    if (!token) {
        return { authenticated: false, error: 'No token provided' };
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return { authenticated: false, error: 'Invalid or expired token' };
    }

    return { authenticated: true, user: decoded };
};

// Validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6;
};

// User roles constants
export const USER_ROLES = {
    SUPERADMIN: 'SUPERADMIN',
    ADMIN: 'ADMIN',
    ASESOR: 'ASESOR',
    ASESI: 'ASESI',
};

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
    SUPERADMIN: 4,
    ADMIN: 3,
    ASESOR: 2,
    ASESI: 1,
};

// Check if role is valid
export const isValidRole = (role) => {
    return Object.values(USER_ROLES).includes(role);
};

// Check if user has required role or higher
export const hasRole = (userRole, requiredRole) => {
    if (!isValidRole(userRole) || !isValidRole(requiredRole)) {
        return false;
    }
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Check if user has exact role
export const hasExactRole = (userRole, requiredRole) => {
    return userRole === requiredRole;
};

// Check if user is SUPERADMIN
export const isSuperAdmin = (userRole) => {
    return userRole === USER_ROLES.SUPERADMIN;
};

// Check if user is ADMIN or higher
export const isAdmin = (userRole) => {
    return hasRole(userRole, USER_ROLES.ADMIN);
};

// Check if user is ASESOR or higher
export const isAsesor = (userRole) => {
    return hasRole(userRole, USER_ROLES.ASESOR);
};

// Middleware to require specific role
export const requireRole = async (request, requiredRole) => {
    const auth = await requireAuth(request);

    if (!auth.authenticated) {
        return { authorized: false, error: auth.error };
    }

    if (!hasRole(auth.user.role, requiredRole)) {
        return {
            authorized: false,
            error: 'Insufficient permissions',
            requiredRole,
            userRole: auth.user.role,
        };
    }

    return { authorized: true, user: auth.user };
};
