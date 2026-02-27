'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in on mount
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                // Verify token by making request to /api/auth/me
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    // Token invalid or expired
                    logout();
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const isAuthenticated = () => {
        return !!user;
    };

    // Role checking functions
    const hasRole = (requiredRole) => {
        if (!user || !user.role) return false;

        const roleHierarchy = {
            SUPERADMIN: 4,
            ADMIN: 3,
            ASESOR: 2,
            ASESI: 1,
        };

        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    };

    const isSuperAdmin = () => {
        return user?.role === 'SUPERADMIN';
    };

    const isAdmin = () => {
        return hasRole('ADMIN');
    };

    const isAsesor = () => {
        return hasRole('ASESOR');
    };

    const isAsesi = () => {
        return user?.role === 'ASESI';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated,
                checkAuth,
                hasRole,
                isSuperAdmin,
                isAdmin,
                isAsesor,
                isAsesi,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
