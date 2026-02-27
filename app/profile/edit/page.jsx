'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const roleBadge = (role) => {
    const map = {
        SUPERADMIN: 'bg-red-500/20 text-red-400 border-red-500/40',
        ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
        ASESOR: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        ASESI: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    };
    return map[role] || map.ASESI;
};

export default function EditProfilePage() {
    const router = useRouter();
    const { user, loading, isAuthenticated, checkAuth } = useAuth();

    const [form, setForm] = useState({
        full_name: '',
        username: '',
        email: '',
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showPassSection, setShowPassSection] = useState(false);

    // Auth guard
    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Prefill form with current user data
    useEffect(() => {
        if (user) {
            setForm(f => ({
                ...f,
                full_name: user.full_name || '',
                username: user.username || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate password fields if changing password
        if (showPassSection && form.new_password) {
            if (form.new_password !== form.confirm_password) {
                setError('Konfirmasi password tidak cocok');
                return;
            }
            if (form.new_password.length < 6) {
                setError('Password baru minimal 6 karakter');
                return;
            }
            if (!form.current_password) {
                setError('Password saat ini wajib diisi untuk mengubah password');
                return;
            }
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const body = {
                full_name: form.full_name,
                username: form.username,
                email: form.email,
            };
            if (showPassSection && form.new_password) {
                body.current_password = form.current_password;
                body.new_password = form.new_password;
            }

            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Gagal memperbarui profil');
                return;
            }

            // Refresh auth state so Navbar updates
            await checkAuth();

            setSuccess('Profil berhasil diperbarui!');
            setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }));
            setShowPassSection(false);
        } catch {
            setError('Terjadi kesalahan, coba lagi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <span className="material-icons-outlined text-primary text-6xl animate-spin">refresh</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20">
            <div className="container-standard max-w-3xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
                    <span className="material-icons-outlined text-base">chevron_right</span>
                    <span className="text-white">Edit Profil</span>
                </div>

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <span className="material-icons-outlined text-primary text-3xl">manage_accounts</span>
                        Edit Profil
                    </h1>
                    <p className="text-slate-400 mt-1">Perbarui informasi akun Anda</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-surface-dark border border-white/10 rounded-xl p-6 text-center sticky top-28">
                            {/* Avatar */}
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                                <span className="material-icons-outlined text-primary text-4xl">person</span>
                            </div>
                            <h3 className="text-white font-bold text-lg">{user?.full_name || user?.username}</h3>
                            <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
                            <div className="mt-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${roleBadge(user?.role)}`}>
                                    {user?.role}
                                </span>
                            </div>
                            <div className="mt-5 pt-5 border-t border-white/10 text-left space-y-3">
                                <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                                    <span className="material-icons-outlined text-base text-slate-500">badge</span>
                                    <span className="text-slate-300">@{user?.username}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                                    <span className="material-icons-outlined text-base text-slate-500">calendar_today</span>
                                    <span>
                                        Bergabung{' '}
                                        {user?.created_at
                                            ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : '—'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm">
                                    <span className="material-icons-outlined text-base text-slate-500">circle</span>
                                    <span className={user?.is_active ? 'text-green-400' : 'text-red-400'}>
                                        {user?.is_active ? 'Akun Aktif' : 'Akun Nonaktif'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Notification */}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3.5 flex items-center gap-2">
                                <span className="material-icons-outlined text-base">check_circle</span>
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3.5 flex items-center gap-2">
                                <span className="material-icons-outlined text-base">error</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Info Pribadi */}
                            <div className="bg-surface-dark border border-white/10 rounded-xl p-6">
                                <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                                    <span className="material-icons-outlined text-primary text-xl">person</span>
                                    Informasi Pribadi
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">
                                            Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={form.full_name}
                                            onChange={handleChange}
                                            placeholder="Masukkan nama lengkap"
                                            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">
                                            Username <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                                            <input
                                                type="text"
                                                name="username"
                                                value={form.username}
                                                onChange={handleChange}
                                                required
                                                placeholder="username"
                                                className="w-full bg-background-dark border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">
                                            Email <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="email@example.com"
                                            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ubah Password */}
                            <div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPassSection(p => !p);
                                        setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }));
                                    }}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-white font-bold text-lg flex items-center gap-2">
                                        <span className="material-icons-outlined text-primary text-xl">lock</span>
                                        Ubah Password
                                    </span>
                                    <span className="material-icons-outlined text-slate-400">
                                        {showPassSection ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {showPassSection && (
                                    <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-5">
                                        <div>
                                            <label className="block text-slate-400 text-sm font-medium mb-1.5">
                                                Password Saat Ini <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="current_password"
                                                value={form.current_password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm font-medium mb-1.5">
                                                Password Baru <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="new_password"
                                                value={form.new_password}
                                                onChange={handleChange}
                                                placeholder="Minimal 6 karakter"
                                                className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm font-medium mb-1.5">
                                                Konfirmasi Password Baru <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="confirm_password"
                                                value={form.confirm_password}
                                                onChange={handleChange}
                                                placeholder="Ulangi password baru"
                                                className={`w-full bg-background-dark border rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none transition-colors ${
                                                    form.confirm_password && form.new_password !== form.confirm_password
                                                        ? 'border-red-500/50 focus:border-red-500/70'
                                                        : 'border-white/10 focus:border-primary/50'
                                                }`}
                                            />
                                            {form.confirm_password && form.new_password !== form.confirm_password && (
                                                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                                                    <span className="material-icons-outlined text-sm">error</span>
                                                    Password tidak cocok
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between gap-4">
                                <Link
                                    href="/"
                                    className="px-6 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all font-medium"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-primary text-background-dark rounded-lg font-bold hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saving && <span className="material-icons-outlined text-base animate-spin">refresh</span>}
                                    <span className="material-icons-outlined text-base">save</span>
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
