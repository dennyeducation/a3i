'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCertificates: 0,
        totalApplications: 0,
        activeUsers: 0,
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            router.push('/login');
            return;
        }

        if (!loading && isAuthenticated()) {
            if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
                router.push('/');
                return;
            }
            fetchStats();
            fetchRecentUsers();
        }
    }, [loading, isAuthenticated, user, router]);

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchRecentUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/users?limit=5', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) setRecentUsers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <div className="text-center">
                    <span className="material-icons-outlined text-primary text-6xl animate-spin">refresh</span>
                    <p className="text-slate-400 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20">
            <div className="container-standard">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-icons-outlined text-primary text-3xl">admin_panel_settings</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Admin Panel</h1>
                    </div>
                    <p className="text-slate-400 text-lg">Kelola pengguna, sertifikat, dan sistem LSP A3I.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-surface-dark border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="material-icons-outlined text-primary text-2xl">group</span>
                            </div>
                            <span className="text-3xl font-extrabold text-white">
                                {loadingStats ? '—' : stats.totalUsers}
                            </span>
                        </div>
                        <h3 className="text-slate-400 font-medium">Total Pengguna</h3>
                    </div>

                    <div className="bg-surface-dark border border-white/10 rounded-xl p-6 hover:border-green-500/50 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <span className="material-icons-outlined text-green-400 text-2xl">how_to_reg</span>
                            </div>
                            <span className="text-3xl font-extrabold text-white">
                                {loadingStats ? '—' : stats.activeUsers}
                            </span>
                        </div>
                        <h3 className="text-slate-400 font-medium">Pengguna Aktif</h3>
                    </div>

                    <div className="bg-surface-dark border border-white/10 rounded-xl p-6 hover:border-yellow-500/50 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                <span className="material-icons-outlined text-yellow-400 text-2xl">workspace_premium</span>
                            </div>
                            <span className="text-3xl font-extrabold text-white">
                                {loadingStats ? '—' : stats.totalCertificates}
                            </span>
                        </div>
                        <h3 className="text-slate-400 font-medium">Total Sertifikat</h3>
                    </div>

                    <div className="bg-surface-dark border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <span className="material-icons-outlined text-blue-400 text-2xl">description</span>
                            </div>
                            <span className="text-3xl font-extrabold text-white">
                                {loadingStats ? '—' : stats.totalApplications}
                            </span>
                        </div>
                        <h3 className="text-slate-400 font-medium">Pendaftaran</h3>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-surface-dark border border-white/10 rounded-xl p-8 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Manajemen</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            href="/admin/schemes"
                            className="flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/50 rounded-lg p-5 transition-all group"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20">
                                <span className="material-icons-outlined text-primary text-2xl">schema</span>
                            </div>
                            <div>
                                <p className="text-white font-bold">Skema Sertifikasi</p>
                                <p className="text-slate-400 text-sm">Kelola skema kompetensi</p>
                            </div>
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/50 rounded-lg p-5 transition-all group"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20">
                                <span className="material-icons-outlined text-primary text-2xl">manage_accounts</span>
                            </div>
                            <div>
                                <p className="text-white font-bold">Kelola Pengguna</p>
                                <p className="text-slate-400 text-sm">Tambah, edit, hapus pengguna</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/certificates"
                            className="flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-yellow-500/10 hover:border-yellow-500/50 rounded-lg p-5 transition-all group"
                        >
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20">
                                <span className="material-icons-outlined text-yellow-400 text-2xl">workspace_premium</span>
                            </div>
                            <div>
                                <p className="text-white font-bold">Kelola Sertifikat</p>
                                <p className="text-slate-400 text-sm">Terbitkan dan kelola sertifikat</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/applications"
                            className="flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/50 rounded-lg p-5 transition-all group"
                        >
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20">
                                <span className="material-icons-outlined text-blue-400 text-2xl">description</span>
                            </div>
                            <div>
                                <p className="text-white font-bold">Pendaftaran</p>
                                <p className="text-slate-400 text-sm">Proses permohonan masuk</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/asesi"
                            className="flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-teal-500/10 hover:border-teal-500/50 rounded-lg p-5 transition-all group"
                        >
                            <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center group-hover:bg-teal-500/20">
                                <span className="material-icons-outlined text-teal-400 text-2xl">people</span>
                            </div>
                            <div>
                                <p className="text-white font-bold">Kelola Asesi</p>
                                <p className="text-slate-400 text-sm">Data peserta sertifikasi</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/asesor"
                            className="flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-orange-500/10 hover:border-orange-500/50 rounded-lg p-5 transition-all group"
                        >
                            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20">
                                <span className="material-icons-outlined text-orange-400 text-2xl">badge</span>
                            </div>
                            <div>
                                <p className="text-white font-bold">Kelola Asesor</p>
                                <p className="text-slate-400 text-sm">Daftar asesor kompetensi</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-surface-dark border border-white/10 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Pengguna Terbaru</h2>
                        <Link href="/admin/users" className="text-primary text-sm font-medium hover:underline">
                            Lihat Semua
                        </Link>
                    </div>
                    {recentUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-icons-outlined text-slate-600 text-5xl mb-3">group</span>
                            <p className="text-slate-500">Belum ada data pengguna</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentUsers.map((u) => (
                                <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            <span className="material-icons-outlined text-primary text-lg">person</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{u.full_name || u.username}</p>
                                            <p className="text-slate-400 text-sm">{u.email}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/30">
                                        {u.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
